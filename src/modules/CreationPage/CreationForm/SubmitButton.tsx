import { useFormikContext } from "formik";
import Button from "../../../components/Button";
import React from "react"

const SubmitButton = () => {
    const { isSubmitting, submitForm} = useFormikContext();
    
    return (
        <Button loading={isSubmitting} onClick={submitForm}>
            Create
        </Button>
    );
};

export default SubmitButton;