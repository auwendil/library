import styles from './Select.module.scss';

import React from 'react';

function Select(props) {
    return (
        <div className="mb-3">
            <label htmlFor={props.name} className="form-label">{props.title}</label>
            <select
                id={props.name}
                name={props.name}
                className={props.className}
                onChange={props.onChange}
                value={props.value}
            >
                <option value="">{props.placeholder}</option>
                {props.options.map(item => (
                    <option key={item.value} value={item.value}>{item.displayName}</option>
                ))}
            </select>

            <div className={props.errorDiv}>{props.errorMsg}</div>
        </div>
    );
}

Select.propTypes = {};

export default Select;