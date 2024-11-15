export type VisibilityCondition = [
    string,
    'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte',
    any
];

export type FieldSchema =
    | {
          type: 'string';
          min?: number; // Optional min property for strings
          minLength?: number;
          maxLength?: number;
          required?: boolean;
          title?: string;
          description?: string;
          visibility?: VisibilityCondition;
          multiline?: boolean;
      }
    | {
          type: 'number';
          minValue?: number;
          maxValue?: number;
          required?: boolean;
          title?: string;
          description?: string;
          visibility?: VisibilityCondition;
      }
    | {
          type: 'boolean';
          required?: boolean;
          title?: string;
          description?: string;
          visibility?: VisibilityCondition;
      }
    | {
          type: 'category';
          options: string[];
          required?: boolean;
          title?: string;
          description?: string;
          visibility?: VisibilityCondition;
      }
    | {
          type: 'object';
          params: Schema;
          required?: boolean;
          title?: string;
          description?: string;
          visibility?: VisibilityCondition;
      };

export type Schema = { [key: string]: FieldSchema };

export type FormValues = { [key: string]: any }; // Explicit type for formik values
