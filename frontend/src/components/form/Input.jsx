import styles from './Input.module.scss';

import React, { forwardRef } from 'react';

const Input = forwardRef((props, ref) => {
    return (
        <div className="mb-3">
            <label htmlFor={props.name} className="form-label">{props.title}</label>
            <input
                id={props.name}
                ref={ref}
                type={props.type}
                className={styles.input + ' ' + props.className}
                name={props.name}
                placeholder={props.placeholder}
                onChange={props.onChange}
                autoComplete={props.autoComplete}
                value={props.value}
            />

            <div className={props.errorDiv}>{props.errorMsg}</div>
        </div>
    );
});

Input.propTypes = {};

export default Input;