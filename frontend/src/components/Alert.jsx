import styles from './Alert.module.scss';

import React from 'react';

function Alert(props) {
    return (
        <div className={'alert ' + props.className} role="alert">
            {props.children}
        </div>
    );
}

Alert.propTypes = {};

export default Alert;