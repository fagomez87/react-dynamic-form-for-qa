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
      minLength: number, // Stage 2 solution
      maxLength: number, // Stage 2 solution
      visibility?: VisibilityCondition;
      required?: boolean;
      title?: string; // Stage 1 solution
      description?: string; // Stage 1 solution
    }
  | { type: "number"; visibility?: VisibilityCondition; required?: boolean; title?: string; description?: string, minValue: number, maxValue: number }
  | { type: "boolean"; visibility?: VisibilityCondition; required?: boolean; title?: string; description?: string }
  | {
      type: "category";
      options: string[];
      visibility?: VisibilityCondition;
      required?: boolean;
      title?: string; // Stage 1 solution
      description?: string; // Stage 1 solution
    }
  | {
      type: "object";
      params: Schema;
      visibility?: VisibilityCondition;
      required?: boolean;
      title?: string; // Stage 1 solution
      description?: string; // Stage 1 solution
    };

export type Schema = { [key: string]: FieldSchema };

interface FormFieldProps {
  fieldKey: string;
  fieldSchema: FieldSchema;
  value: any;
  onChange: (key: string, value: any) => void;
  errors: { [key: string]: string[] }; // Stage 3 solution
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

  // Stage 1 solution, render title and description is exists
  return (
    <div>
      <label className="block font-semibold mb-2">
        {fieldSchema.title || fieldKey.split('.').pop()} 
        {fieldSchema.required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-gray-600 mb-1">{fieldSchema.description}</p>
      {renderField()}
      {errors[fieldKey] && <p className="text-red-500">{errors[fieldKey]}</p>}
    </div>
  );
};

interface DynamicFormProps {
  schema: Schema;
}

// Function to get dependencies from the schema
const getDependencies = (schema: Schema): { [key: string]: string[] } => {
  const dependencies: { [key: string]: string[] } = {};

  Object.keys(schema).forEach((key) => {
    const fieldSchema = schema[key];
    if (fieldSchema.visibility) {
      const [dependency] = fieldSchema.visibility;
      if (!dependencies[key]) {
        dependencies[key] = [];
      }
      dependencies[key].push(dependency);
    }
  });

  return dependencies;
};

// Function to detect broken links in the schema
const detectBrokenLinks = (schema: Schema): string[] => {
  const missingDependencies: string[] = [];
  const allKeys = Object.keys(schema);

  Object.keys(schema).forEach((key) => {
    const fieldSchema = schema[key];
    if (fieldSchema.visibility) {
      const [dependency] = fieldSchema.visibility;
      if (!allKeys.includes(dependency)) {
        missingDependencies.push(`Field "${key}" depends on missing field "${dependency}".`);
      }
    }
  });

  return missingDependencies;
};

// Function to perform topological sort
const topologicalSort = (schema: Schema): string[] => {
  const dependencies = getDependencies(schema);
  const indegree: { [key: string]: number } = {};
  const order: string[] = [];

  // Initialize indegree
  Object.keys(schema).forEach((key) => {
    indegree[key] = 0;
  });

  // Calculate indegrees
  Object.keys(dependencies).forEach((key) => {
    dependencies[key].forEach((dependency) => {
      indegree[dependency] = (indegree[dependency] || 0) + 1;
    });
  });

  const queue: string[] = Object.keys(indegree).filter((key) => indegree[key] === 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    // Decrease indegree for neighbors
    if (dependencies[current]) {
      dependencies[current].forEach((dependency) => {
        indegree[dependency]--;
        if (indegree[dependency] === 0) {
          queue.push(dependency);
        }
      });
    }
  }

  // Check for cycles
  if (order.length !== Object.keys(schema).length) {
    throw new Error("Cycle detected in schema dependencies");
  }

  return order;
};

export const DynamicForm = ({ schema }: DynamicFormProps) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({}); // Stage 3 solution

  // Detect broken links
  const brokenLinks = detectBrokenLinks(schema);
  if (brokenLinks.length > 0) {
    throw new Error(`Schema cannot be rendered due to missing dependencies: ${brokenLinks.join(", ")}`);
  }

  // Get sorted keys based on dependencies
  const sortedKeys = topologicalSort(schema);

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
          {sortedKeys.map(
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

// Stage 3 solution
const errorMessages = {
  required: (fieldKey: string) => `${fieldKey} is required.`,
  minLength: (fieldKey: string, minLength: number) => `${fieldKey} must be at least ${minLength} characters long.`,
  maxLength: (fieldKey: string, maxLength: number) => `${fieldKey} must not exceed ${maxLength} characters.`,
  minValue: (fieldKey: string, minValue: number) => `${fieldKey} must be at least ${minValue}.`,
  maxValue: (fieldKey: string, maxValue: number) => `${fieldKey} must not exceed ${maxValue}.`,
  invalidType: (fieldKey: string) => `${fieldKey} has an invalid value.`,
};

const getErrors = (
  schema: Schema,
  values: { [key: string]: any }
): { [key: string]: string[] } => {
  const errors: { [key: string]: string[] } = {};

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
    } else { // Stage 3 solution
      const error = validateField(fieldSchema, value, key, values)
      if (error) {
        if (!errors[key]) {
          errors[key] = []
        }
        errors[key].push(error)
      }
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
  fieldKey: string,
  values: Record<string, any>
): string | null => {
  if (
    fieldSchema.visibility &&
    !evaluateCondition(fieldSchema.visibility, values)
  ) {
    return null; // Field is not visible
  }

  if (
    fieldSchema.required &&
    (value === null || value === undefined || value === "")
  ) {
    return errorMessages.required(fieldKey);
  }

  switch (fieldSchema.type) { // Stage 3 solution
    case "string":
      if (typeof value !== "string") return errorMessages.invalidType(fieldKey);
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) return errorMessages.minLength(fieldKey, fieldSchema.minLength);
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) return errorMessages.maxLength(fieldKey, fieldSchema.maxLength);
      return null;
    case "number":
      if (typeof value !== "number") return errorMessages.invalidType(fieldKey);
      if (fieldSchema.minValue !== undefined && value < fieldSchema.minValue) return errorMessages.minValue(fieldKey, fieldSchema.minValue);
      if (fieldSchema.maxValue !== undefined && value > fieldSchema.maxValue) return errorMessages.maxValue(fieldKey, fieldSchema.maxValue);
      return null;
    case "boolean":
      if (typeof value !== "boolean") return errorMessages.invalidType(fieldKey);
      return null
    case "category":
      if (!fieldSchema.options.includes(value)) return errorMessages.invalidType(fieldKey);
      return null;
    case "object":
      if (typeof value !== "object" || value === null) return errorMessages.invalidType(fieldKey);
      return null;
    default:
      return null;
  }
};

const validateSchema = (
  schema: Schema,
  values: { [key: string]: any }
): boolean => {
  return Object.keys(schema).every((key) => {
    const fieldSchema = schema[key];
    const value = values[key];

    return validateField(fieldSchema, value, key, values);
  });
};
