import styles from './CheckBox.module.scss';

import React from 'react';

function CheckBox(props) {
    return (
        <div className="form-check">
            <input
                id={props.name}
                name={props.name}
                className="form-check-input"
                type="checkbox"
                value={props.value}
                onChange={props.onCheck}
                checked={props.checked}
                disabled={props.disabled}
            />
            <label htmlFor={props.name} className="form-check-label">{props.title}</label>
        </div>
    );
}

CheckBox.propTypes = {};

export default CheckBox;