import { Link, NavLink } from 'react-router-dom';
import styles from './Navigation.module.scss';

import React from 'react';

function Navigation(props) {
    return (
        <nav className={styles.nav}>
            {/*<div className="list-group">*/}
            {/*<Link to="/" className="list-group-item list-group-item-action">Home</Link>*/}
            <NavLink to="/library" end={true}
                     className={({ isActive }) => (isActive ? styles.activeNavLink : styles.navLink)}>Library</NavLink>
            <NavLink to="/genres" end={true}
                     className={({ isActive }) => (isActive ? styles.activeNavLink : styles.navLink)}>Genres</NavLink>

            {props.jwtToken !== '' &&
                <>
                    <NavLink to="/admin/library/0" end={true}
                             className={({ isActive }) => (isActive ? styles.activeNavLink : styles.navLink)}>
                        Add Book
                    </NavLink>
                    <NavLink to="/admin/library" end={true}
                             className={({ isActive }) => (isActive ? styles.activeNavLink : styles.navLink)}>
                        Manage Library
                    </NavLink>
                    <NavLink to="/graphql" end={true}
                             className={({ isActive }) => (isActive ? styles.activeNavLink : styles.navLink)}>
                        GraphQL
                    </NavLink>
                </>
            }

            {/*className="list-group-item list-group-item-action"*/}
            {/*</div>*/}
        </nav>
    );
}

Navigation.propTypes = {};

export default Navigation;