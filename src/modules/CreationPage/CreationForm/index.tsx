import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import ImagePicker from "./TextArea";
import FormikInput from "../../../components/input";
import TextArea from "./TextArea";
import SubmitButton from "./SubmitButton";

export type CreationValues = {
    name: string;
    description:string;
    image?:File;
}

type CreationFormProps = {
    onSubmit: (values: CreationValues) => Promise<void>;
};

export const creationValidationSchema = Yup.object().shape({
    name: Yup.string().required("Must enter a name"),
    description: Yup.string().required("Must enter a description"),
    price: Yup.number().test("is_gt_zero", "Must enter a price", (value) => {
        return typeof value == "number" && value > 0;
    }),
    image: Yup.mixed().test("is_defined", "Must select an image", (value) => 
        Boolean(value)
    ),
});

const CreationForm = ({onSubmit} : CreationFormProps) => {
    const initialValues: CreationValues = {name: "", description: ""};
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={creationValidationSchema}
            validateOnBlur={false}
            validateOnChange={false}
            validateOnMount={false}
            onSubmit={onSubmit}
        >
            <Form className="flex">
                <ImagePicker name="image" className="mr-4"/>
                <div className="flex w-64 flex-col">
                    <FormikInput></FormikInput>
                    <TextArea name="description"></TextArea>
                    <SubmitButton/>
                </div>
            </Form>
        </Formik>
    );
};

export default CreationForm;