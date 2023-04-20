package main

import (
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"log"
	"net/http"
	"strings"
	"time"
)

type auth struct {
	Issuer            string
	Audience          string
	SecretKey         string
	TokenExpire       time.Duration
	RefreshExpireDate time.Duration

	Cookie cookie
}

type cookie struct {
	Name   string
	Domain string
	Path   string
}

type jwtUser struct {
	Id        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type tokenPairs struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type claims struct {
	jwt.RegisteredClaims
}

func (j *auth) GenerateTokens(user *jwtUser) (tokenPairs, error) {
	nowTime := time.Now().UTC()

	accessToken := jwt.New(jwt.SigningMethodHS256)
	accessTokenClaims := accessToken.Claims.(jwt.MapClaims)
	accessTokenClaims["name"] = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
	accessTokenClaims["typ"] = "JWT"
	accessTokenClaims["sub"] = fmt.Sprintf("%d", user.Id)
	accessTokenClaims["aud"] = j.Audience
	accessTokenClaims["iss"] = j.Issuer
	accessTokenClaims["iat"] = nowTime.Unix()
	accessTokenClaims["exp"] = nowTime.Add(j.TokenExpire).Unix()

	signedAccessToken, err := accessToken.SignedString([]byte(j.SecretKey))
	if err != nil {
		log.Println("Cannot sign access token ", err)
		return tokenPairs{}, err
	}

	refreshToken := jwt.New(jwt.SigningMethodHS256)
	refreshTokenClaims := refreshToken.Claims.(jwt.MapClaims)
	refreshTokenClaims["sub"] = fmt.Sprintf("%d", user.Id)
	refreshTokenClaims["iat"] = nowTime.Unix()
	refreshTokenClaims["exp"] = nowTime.Add(j.RefreshExpireDate).Unix()

	signedRefreshToken, err := refreshToken.SignedString([]byte(j.SecretKey))
	if err != nil {
		log.Println("Cannot sign refresh token ", err)
		return tokenPairs{}, err
	}

	var pairs = tokenPairs{
		AccessToken:  signedAccessToken,
		RefreshToken: signedRefreshToken,
	}
	return pairs, nil
}

func (j *auth) GetRefreshCookie(refreshToken string) *http.Cookie {
	return &http.Cookie{
		Name:     j.Cookie.Name,
		Path:     j.Cookie.Path,
		Value:    refreshToken,
		Expires:  time.Now().UTC().Add(j.RefreshExpireDate),
		MaxAge:   int(j.RefreshExpireDate.Seconds()),
		SameSite: http.SameSiteStrictMode,
		Domain:   j.Cookie.Domain,
		HttpOnly: true,
		Secure:   true,
	}
}

func (j *auth) GetExpiredRefreshCookie() *http.Cookie {
	return &http.Cookie{
		Name:     j.Cookie.Name,
		Path:     j.Cookie.Path,
		Value:    "",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		SameSite: http.SameSiteStrictMode,
		Domain:   j.Cookie.Domain,
		HttpOnly: true,
		Secure:   true,
	}
}

func (j *auth) GetTokenFromHeader(w http.ResponseWriter, r *http.Request) (string, *claims, error) {
	w.Header().Add("Vary", "Authorization")

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", nil, errors.New("no auth header")
	}

	parsedHeader := strings.Split(authHeader, " ")
	if len(parsedHeader) != 2 {
		return "", nil, errors.New("invalid auth header")
	}

	if parsedHeader[0] != "Bearer" {
		return "", nil, errors.New("invalid auth header")
	}

	token := parsedHeader[1]
	claims := &claims{}

	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method %v", token.Header["alg"])
		}
		return []byte(j.SecretKey), nil
	})
	if err != nil {
		//if strings.HasPrefix(err.Error(), "token is expired") {
		//	return "", nil, errors.New("expired token")
		//}
		return "", nil, err
	}

	if claims.Issuer != j.Issuer {
		return "", nil, errors.New("invalid issuer")
	}

	return token, claims, nil
}
