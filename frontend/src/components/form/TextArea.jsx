import styles from './TextArea.module.scss';

import React from 'react';

function TextArea(props) {
    return (
        <div className="mb-3">
            <label htmlFor={props.name} className="form-label">{props.title}</label>
            <textarea
                id={props.name}
                name={props.name}
                className={props.className}
                placeholder={props.placeholder}
                onChange={props.onChange}
                value={props.value}
                rows={props.rows}
            />

            <div className={props.errorDiv}>{props.errorMsg}</div>
        </div>
    );
}

TextArea.propTypes = {};

export default TextArea;