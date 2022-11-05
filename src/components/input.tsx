import React from "react";
import { InputHTMLAttributes } from "react";
import classNames from "classnames"

type InputProps = { error?: string} &  InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => {
    const {error, className, ...rest} = props;
    
    return (
        <input className={classNames(className, "rounded border px-2 py-2 text-xl", {
            "border-gray-300": !error,
            "border-red-500": error,
        })}
        {...rest}
        />
    );
};

export default Input;