CREATE TABLE public.genres (
                               id SERIAL PRIMARY KEY,
                               genre VARCHAR(255),
                               created_at DATE DEFAULT current_date,
                               updated_at DATE DEFAULT current_date
);

CREATE TABLE public.books (
                              id SERIAL PRIMARY KEY,
                              title VARCHAR(512),
                              author VARCHAR(512),
                              release_date DATE,
                              description TEXT,
                              created_at DATE DEFAULT current_date,
                              updated_at DATE DEFAULT current_date
);

CREATE TABLE public.book_genres (
                                    id SERIAL PRIMARY KEY,
                                    book_id INT,
                                    genre_id INT,
                                    CONSTRAINT fk_book
                                        FOREIGN KEY(book_id)
                                            REFERENCES books(id) ON DELETE CASCADE ON UPDATE CASCADE,
                                    CONSTRAINT fk_genre
                                        FOREIGN KEY(genre_id)
                                            REFERENCES genres(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE public.users (
                              id SERIAL PRIMARY KEY,
                              first_name VARCHAR(255),
                              last_name VARCHAR(255),
                              email VARCHAR(255),
                              password VARCHAR(255),
                              created_at DATE DEFAULT current_date,
                              updated_at DATE DEFAULT current_date
);


INSERT INTO public.genres (genre)
VALUES
    ('Science fiction'),
    ('Fantasy'),
    ('Adventure novel'),
    ('Action'),
    ('Comic book'),
    ('History'),
    ('Historical fiction'),
    ('Detective'),
    ('Horror'),
    ('Romance'),
    ('Literary fiction'),
    ('Biography'),
    ('Cookbook'),
    ('Poetry');

INSERT INTO public.books (title, author, release_date, description)
VALUES
    ('Lord of the Rings', 'J.R.R. Tolkien', '1960-01-01', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'),
    ('In Search Of The Castaways', 'J. Verne', '1960-01-01', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'),
    ('Twenty Thousand Leagues Under The Sea', '1960-01-01', 'J. Verne', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'),
    ('The Mysterious Island', 'J. Verne', '1960-01-01', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'),
    ('A Study in Scarlet', 'A.C. Doyle', '1960-01-01', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'),
    ('The Raven', 'E.A. Poe', '1960-01-01', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit'),
    ('Call of Cthulhu', 'H.P. Lovecraft', '1960-01-01', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit');

INSERT INTO public.book_genres (book_id, genre_id)
VALUES
    (1, 2),
    (2, 1),
    (2, 3),
    (3, 1),
    (3, 3),
    (4, 1),
    (4, 3),
    (5, 3),
    (5, 8),
    (6, 10),
    (7, 9);

INSERT INTO users (first_name, last_name, email, password)
VALUES ('admin', 'admin', 'admin@admin.com', '$2a$10$.sQOyRiwozgOiXaq/15MXOdLOrgOde44XF.m6KpZZoU3FV.1svct2');

