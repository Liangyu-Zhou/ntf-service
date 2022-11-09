import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import ImagePicker from "./ImagePicker";
import FormikInput from "../../../components/input";
import TextArea from "./TextArea";
import SubmitButton from "./SubmitButton";

export type CreationValues = {
    name: string;
    description:string;
    image?:File;
};

type CreationFormProps = {
    onSubmit: (values: CreationValues) => Promise<void>;
};

export const creationValidationSchema = Yup.object().shape({
    name: Yup.string().required("Must enter a name"),
    description: Yup.string().required("Must enter a description"),
    image: Yup.mixed().test("is_defined", "Must select an image", (value) =>
        Boolean(value)
    ),
});

const CreationForm = ({onSubmit} : CreationFormProps) => {
    const initialValues: CreationValues = {name: "", description: ""};
    // console.log("Button, loading:", loading);
    return (
        <Formik
            initialValues={initialValues}
            // validationSchema={creationValidationSchema}
            validateOnBlur={false}
            validateOnChange={false}
            validateOnMount={false}
            onSubmit={onSubmit}
        >
            <Form className="flex">
                <ImagePicker name="image" className="mr-4" />
                <div className="flex w-64 flex-col space-y-1">
                    <FormikInput name="name" placeholder="name" />
                    <TextArea name="description" placeholder="description..." />
                    <SubmitButton />
                </div>
            </Form>
        </Formik>
    );
};

export default CreationForm;