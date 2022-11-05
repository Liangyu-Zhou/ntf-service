import classNames from "classnames";
import React from "react";
import CreationForm, { CreationValues } from "./CreationForm";

const CreationPage = () => {
    const signer = null;

    const onSubmit = async (values: CreationValues) => {

    };

    return (
        <div className={classNames("flex h-full w-full flex-col", {
            "items-center justify-center": !signer,
        })}>
            {signer ? <CreationForm onSubmit={onSubmit}/> : "Connect your wallet"}
        </div>
    );
}

export default CreationPage;