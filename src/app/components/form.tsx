import React, { useState, ChangeEvent } from "react";
import { Input } from "./ui/input";
import { Card, CardContent, CardFooter } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

type VisibilityCondition = [
  string,
  "eq" | "neq" | "gt" | "lt" | "gte" | "lte",
  any
];

type FieldSchema =
  | {
      type: "string";
      multiline?: boolean;
      min?: number;
      visibility?: VisibilityCondition;
      required?: boolean;
    }
  | { type: "number"; visibility?: VisibilityCondition; required?: boolean }
  | { type: "boolean"; visibility?: VisibilityCondition; required?: boolean }
  | {
      type: "category";
      options: string[];
      visibility?: VisibilityCondition;
      required?: boolean;
    }
  | {
      type: "object";
      params: Schema;
      visibility?: VisibilityCondition;
      required?: boolean;
    };

export type Schema = { [key: string]: FieldSchema };

interface FormFieldProps {
  fieldKey: string;
  fieldSchema: FieldSchema;
  value: any;
  onChange: (key: string, value: any) => void;
  errors: { [key: string]: string };
}

const FormField: React.FC<FormFieldProps> = ({
  fieldKey,
  fieldSchema,
  value,
  onChange,
  errors,
}) => {
  const renderField = () => {
    switch (fieldSchema.type) {
      case "string":
        if (fieldSchema.multiline) {
          return (
            <Textarea
              onChange={(e: ChangeEvent<any>) =>
                onChange(fieldKey, e.target.value.trim())
              }
            />
          );
        }
        return (
          <Input
            onChange={(e: ChangeEvent<any>) =>
              onChange(fieldKey, e.target.value.trim())
            }
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(fieldKey, e.target.value)
            }
          />
        );
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(fieldKey, e.target.checked)
            }
          />
        );
      case "category":
        return (
          <Select
            value={value || ""}
            onValueChange={(value) => onChange(fieldKey, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "object":
        return (
          <div className="mb-4 pl-4 border-border border-l">
            {Object.keys(fieldSchema.params).map((key) => (
              <FormField
                key={key}
                fieldKey={`${fieldKey}.${key}`}
                fieldSchema={fieldSchema.params[key]}
                value={value ? value[key] : ""}
                onChange={(subKey, val) => {
                  const newValue = {
                    ...value,
                    [subKey.split(".").pop()!]: val,
                  };
                  onChange(fieldKey, newValue);
                }}
                errors={errors}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block font-semibold mb-2">
        {fieldKey.split(".").pop()}
        {fieldSchema.required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {errors[fieldKey] && <p className="text-red-500">{errors[fieldKey]}</p>}
    </div>
  );
};

interface DynamicFormProps {
  schema: Schema;
}

export const DynamicForm = ({ schema }: DynamicFormProps) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = key.split(".");
      let temp = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!temp[keys[i]]) temp[keys[i]] = {};
        temp = temp[keys[i]];
      }
      temp[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = () => {
    const newErrors = getErrors(schema, formData);

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Form submitted successfully!");
    }
  };

  const shouldRenderField = (fieldKey: string, fieldSchema: FieldSchema) => {
    if (fieldSchema.visibility) {
      return evaluateCondition(fieldSchema.visibility, formData);
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="flex flex-col gap-2 py-2">
          {Object.keys(schema).map(
            (key) =>
              shouldRenderField(key, schema[key]) && (
                <FormField
                  key={key}
                  fieldKey={key}
                  fieldSchema={schema[key]}
                  value={formData[key]}
                  onChange={handleChange}
                  errors={errors}
                />
              )
          )}
        </CardContent>
        <CardFooter>
          <Button type="button" onClick={handleSubmit}>
            Submit
          </Button>
        </CardFooter>
      </Card>
      <pre className="mt-4 bg-gray-100 p-4 overflow-auto">
        Values: <br />
        {JSON.stringify(formData, null, 2)}
      </pre>
      <pre className="mt-4 bg-gray-100 p-4 overflow-auto">
        Errors:
        <br />
        {JSON.stringify(errors, null, 2)}
      </pre>
      <pre className="mt-4 bg-gray-100 p-4 overflow-auto">
        Is valid
        <br />
        {validateSchema(schema, formData) ? "true" : "false"}
      </pre>
    </form>
  );
};

const getErrors = (
  schema: Schema,
  values: { [key: string]: any }
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  Object.keys(schema).forEach((key) => {
    const fieldSchema = schema[key];
    const value = values[key];

    if (
      fieldSchema.visibility &&
      !evaluateCondition(fieldSchema.visibility, values)
    ) {
      return;
    }

    if (fieldSchema.type === "object") {
      const nestedErrors = getErrors(fieldSchema.params, value ?? {});
      Object.keys(nestedErrors).forEach((nestedKey) => {
        errors[`${key}.${nestedKey}`] = nestedErrors[nestedKey];
      });
    } else if (!validateField(fieldSchema, value, values)) {
      errors[key] = `Invalid value for ${key}`;
    }
  });

  return errors;
};

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const evaluateCondition = (
  condition: VisibilityCondition,
  values: { [key: string]: any }
) => {
  const [dependency, operator, value] = condition;
  const dependencyValue = getNestedValue(values, dependency);

  switch (operator) {
    case "eq":
      return dependencyValue === value;
    case "neq":
      return dependencyValue !== value;
    case "gt":
      return dependencyValue > value;
    case "lt":
      return dependencyValue < value;
    case "gte":
      return dependencyValue >= value;
    case "lte":
      return dependencyValue <= value;
    default:
      return false;
  }
};

const validateField = (
  fieldSchema: FieldSchema,
  value: any,
  values: Record<string, any>
): boolean => {
  if (
    fieldSchema.visibility &&
    !evaluateCondition(fieldSchema.visibility, values)
  ) {
    return true;
  }

  if (
    fieldSchema.required &&
    (value === null || value === undefined || value === "")
  ) {
    return false;
  }

  switch (fieldSchema.type) {
    case "string":
      if (typeof value !== "string") return false;
      if (fieldSchema.min && value.length < fieldSchema.min) return false;
      return true;
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "category":
      return fieldSchema.options.includes(value);
    case "object":
      if (typeof value !== "object" || value === null) return false;
      return validateSchema(fieldSchema.params, value);
    default:
      return false;
  }
};

const validateSchema = (
  schema: Schema,
  values: { [key: string]: any }
): boolean => {
  return Object.keys(schema).every((key) => {
    const fieldSchema = schema[key];
    const value = values[key];

    return validateField(fieldSchema, value, values);
  });
};
