import { FieldSchema, FormValues, Schema } from '@/types';
import { Field, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';

const DynamicForm = ({ schema }: { schema: Schema }) => {
    const generateValidationSchema = (schema: Schema) => {
        const validations: { [key: string]: any } = {};
        Object.keys(schema).forEach((key) => {
            const fieldSchema = schema[key];
            switch (fieldSchema.type) {
                case 'string':
                    validations[key] = Yup.string()
                        .min(
                            fieldSchema.minLength || 0,
                            `Minimum ${fieldSchema.minLength} characters`
                        )
                        .max(
                            fieldSchema.maxLength || Infinity,
                            `Maximum ${fieldSchema.maxLength} characters`
                        )
                        .required(
                            fieldSchema.required
                                ? `${key} is required`
                                : undefined
                        );
                    break;
                case 'number':
                    validations[key] = Yup.number()
                        .min(
                            fieldSchema.minValue || -Infinity,
                            `Minimum value is ${fieldSchema.minValue}`
                        )
                        .max(
                            fieldSchema.maxValue || Infinity,
                            `Maximum value is ${fieldSchema.maxValue}`
                        )
                        .required(
                            fieldSchema.required
                                ? `${key} is required`
                                : undefined
                        );
                    break;
                case 'boolean':
                    validations[key] = Yup.boolean().required(
                        fieldSchema.required ? `${key} is required` : undefined
                    );
                    break;
                case 'category':
                    validations[key] = Yup.string()
                        .oneOf(fieldSchema.options)
                        .required(
                            fieldSchema.required
                                ? `${key} is required`
                                : undefined
                        );
                    break;
                default:
                    break;
            }
        });
        return Yup.object().shape(validations);
    };

    const formik = useFormik<FormValues>({
        initialValues: Object.keys(schema).reduce(
            (acc, key) => ({ ...acc, [key]: '' }),
            {}
        ),
        validationSchema: generateValidationSchema(schema),
        onSubmit: (values) =>
            alert(
                'Form submitted successfully with values: ' +
                    JSON.stringify(values)
            ),
    });

    const shouldRenderField = (fieldKey: string, fieldSchema: FieldSchema) => {
        if (fieldSchema.visibility) {
            const [dependency, operator, value] = fieldSchema.visibility;
            const dependencyValue =
                formik.values[dependency as keyof FormValues];

            switch (operator) {
                case 'eq':
                    return dependencyValue === value;
                case 'neq':
                    return dependencyValue !== value;
                case 'gt':
                    return dependencyValue > value;
                case 'lt':
                    return dependencyValue < value;
                case 'gte':
                    return dependencyValue >= value;
                case 'lte':
                    return dependencyValue <= value;
                default:
                    return true;
            }
        }
        return true;
    };

    const getErrorMessage = (error: any) => {
        if (typeof error === 'string') return error;
        if (Array.isArray(error)) return error.join(', ');
        return JSON.stringify(error); // For complex nested errors
    };

    return (
        <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit}>
                {Object.keys(schema).map((key) => {
                    const fieldSchema = schema[key];
                    return (
                        shouldRenderField(key, fieldSchema) && (
                            <div key={key}>
                                <label>
                                    {fieldSchema.title || key}
                                    {fieldSchema.required && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </label>
                                <p>{fieldSchema.description}</p>

                                {/* Render the Field */}
                                <Field name={key}>
                                    {({ field }: any) => {
                                        switch (fieldSchema.type) {
                                            case 'string':
                                                return fieldSchema.multiline ? (
                                                    <textarea {...field} />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        {...field}
                                                    />
                                                );
                                            case 'number':
                                                return (
                                                    <input
                                                        type="number"
                                                        {...field}
                                                    />
                                                );
                                            case 'boolean':
                                                return (
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        {...field}
                                                    />
                                                );
                                            case 'category':
                                                return (
                                                    <select {...field}>
                                                        {fieldSchema.options.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                );
                                            default:
                                                return null;
                                        }
                                    }}
                                </Field>

                                {/* Error Handling */}
                                {formik.touched[key] && formik.errors[key] ? (
                                    <p className="text-red-500">
                                        {getErrorMessage(formik.errors[key])}
                                    </p>
                                ) : null}
                            </div>
                        )
                    );
                })}
                <button type="submit">Submit</button>
            </form>
        </FormikProvider>
    );
};

export default DynamicForm;
