import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import {
  Kind,
  Static,
  StaticDecode,
  TSchema,
  TransformKind,
} from '@sinclair/typebox';
import { TypeCheck } from '@sinclair/typebox/compiler';
import { Value, type ValueError } from '@sinclair/typebox/value';
import {
  FieldError,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';

type ElysiaCustomError =
  | string
  | number
  | boolean
  | ((error: {
      type: string;
      value: unknown;
      property?: string;
      message?: string;
      errors?: ValueError[];
    }) => unknown);

interface ElysiaSchemaOptions {
  error?: ElysiaCustomError;
}

function cleanUndefinedOptionalFields(
  schema: unknown,
  values: unknown,
): unknown {
  // If not an object schema or values, return as-is
  if (
    !values ||
    typeof values !== 'object' ||
    !(schema && typeof schema === 'object')
  ) {
    return values;
  }

  const schemaObj = schema as any;

  // Check if this is an Object schema with properties
  if (schemaObj[Kind] === 'Object' && 'properties' in schemaObj) {
    const result: Record<string, unknown> = {};
    const required = schemaObj.required || [];

    for (const [key, value] of Object.entries(
      values as Record<string, unknown>,
    )) {
      // If value is undefined and field is optional, omit it
      const isOptional = !required.includes(key);
      if (value === undefined && isOptional) {
        continue; // Omit the field entirely
      }
      result[key] = value;
    }

    return result;
  }

  return values;
}

function hasTransform(schema: TSchema): boolean {
  if (TransformKind in schema) {
    return true;
  }
  if (schema[Kind] === 'Object' && 'properties' in schema) {
    return Object.values(schema.properties as Record<string, TSchema>).some(
      hasTransform,
    );
  }
  if (schema[Kind] === 'Array' && 'items' in schema) {
    return hasTransform(schema.items as TSchema);
  }
  if (schema[Kind] === 'Union' && 'anyOf' in schema) {
    return (schema.anyOf as TSchema[]).some(hasTransform);
  }
  return false;
}

function getSchemaAtPath(schema: TSchema, path: string): TSchema | undefined {
  const segments = path.substring(1).split('/').filter(Boolean);
  let current: TSchema | undefined = schema;

  for (const segment of segments) {
    if (!current) {
      return undefined;
    }

    if (current[Kind] === 'Object' && 'properties' in current) {
      const objectSchema = current as TSchema & {
        properties: Record<string, TSchema>;
      };
      current = objectSchema.properties[segment];
    } else if (current[Kind] === 'Array' && 'items' in current) {
      const arraySchema = current as TSchema & { items: TSchema };
      current = arraySchema.items;
    } else {
      return undefined;
    }
  }

  return current;
}

function processCustomError(
  schemaField: TSchema & ElysiaSchemaOptions,
  error: ValueError,
  value: unknown,
): string | undefined {
  if (!schemaField.error) {
    return undefined;
  }

  if (typeof schemaField.error === 'string') {
    return schemaField.error;
  }

  if (typeof schemaField.error === 'function') {
    const result = schemaField.error({
      type: String(error.type),
      value,
      property: error.path,
      message: error.message,
      errors: [error],
    });

    if (typeof result === 'string') {
      return result;
    }
    if (typeof result === 'object' && result !== null && 'message' in result) {
      return String((result as { message: unknown }).message);
    }
  }

  return String(schemaField.error);
}

function parseErrorSchema(
  _errors: ValueError[],
  validateAllFieldCriteria: boolean,
  schema?: TSchema,
  originalValues?: unknown,
) {
  const errors: Record<string, FieldError> = {};
  for (; _errors.length; ) {
    const error = _errors[0];
    const { type, message, path } = error;
    const _path = path.substring(1).replace(/\//g, '.');

    let customMessage = message;
    if (schema) {
      const schemaField = getSchemaAtPath(schema, path);
      if (schemaField) {
        const fieldValue =
          error.value !== undefined
            ? error.value
            : path
                .split('/')
                .filter(Boolean)
                .reduce((obj: unknown, key) => {
                  if (obj && typeof obj === 'object' && key in obj) {
                    return (obj as Record<string, unknown>)[key];
                  }
                  return undefined;
                }, originalValues);

        const custom = processCustomError(
          schemaField as TSchema & ElysiaSchemaOptions,
          error,
          fieldValue,
        );
        if (custom) {
          customMessage = custom;
        }
      }
    }

    if (!errors[_path]) {
      errors[_path] = { message: customMessage, type: '' + type };
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types['' + type];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        '' + type,
        messages
          ? ([] as string[]).concat(messages as string[], customMessage)
          : customMessage,
      ) as FieldError;
    }

    _errors.shift();
  }

  return errors;
}

/**
 * Creates a resolver for react-hook-form using Elysia's extended TypeBox schema validation
 * Supports:
 * - Standard TypeBox schemas
 * - Elysia's Transform types (Numeric, BooleanString, Date, etc.)
 * - Custom error messages via the 'error' property
 * - Error callbacks with context
 *
 * @param {Schema | TypeCheck<Schema>} schema - The Elysia/TypeBox schema to validate against
 * @returns {Resolver<Static<Schema>>} A resolver function compatible with react-hook-form
 * @example
 * import { t } from 'elysia';
 *
 * const schema = t.Object({
 *   name: t.String({
 *     error: 'Name is required'
 *   }),
 *   age: t.Numeric({
 *     error: 'Age must be a valid number'
 *   })
 * });
 *
 * useForm({
 *   resolver: elysiaTypeboxResolver(schema)
 * });
 */
export function elysiaTypeboxResolver<S = unknown>(
  schema: S | TypeCheck<S extends TSchema ? S : TSchema>,
): Resolver<
  S extends TSchema
    ? Static<S> extends FieldValues
      ? Static<S>
      : FieldValues
    : FieldValues
> {
  return async (values, _, options) => {
    const originalValues = values;

    // Clean undefined values from optional fields before validation
    const cleanedValues = cleanUndefinedOptionalFields(schema, values);

    let decodedValues = cleanedValues;
    let errors: ValueError[] = [];

    if (!(schema instanceof TypeCheck) && hasTransform(schema as TSchema)) {
      // First try to decode the entire object
      try {
        decodedValues = Value.Decode(schema as TSchema, cleanedValues);
        errors = [];
      } catch (e) {
        // If full decode fails, try field-by-field decoding to handle optional fields
        if (
          (schema as TSchema)[Kind] === 'Object' &&
          'properties' in (schema as object)
        ) {
          // We've verified at runtime that schema has properties
          const schemaProperties = (
            schema as TSchema & { properties?: Record<string, TSchema> }
          ).properties;
          const schemaRequired = (schema as TSchema & { required?: string[] })
            .required;

          if (!schemaProperties || typeof schemaProperties !== 'object') {
            errors = Array.from(Value.Errors(schema as TSchema, cleanedValues));
          } else {
            const requiredFields = schemaRequired || [];
            const decodedObject = {
              ...(cleanedValues as Record<string, unknown>),
            };
            let hasDecodeError = false;

            for (const [key, propSchema] of Object.entries(schemaProperties)) {
              const inputValues = cleanedValues as Record<string, unknown>;
              const value = inputValues[key];
              const isOptional = !requiredFields.includes(key);

              // Skip undefined values for optional fields
              if (value === undefined && isOptional) {
                continue;
              }

              // Try to decode fields with transforms
              if (hasTransform(propSchema)) {
                try {
                  decodedObject[key] = Value.Decode(propSchema, value);
                } catch (decodeError) {
                  hasDecodeError = true;
                  errors = [
                    {
                      type: 0,
                      schema: propSchema,
                      path: `/${key}`,
                      value: value,
                      message:
                        (decodeError as Error).message ||
                        'Transform decode failed',
                      errors: [],
                    },
                  ];
                  break;
                }
              }
            }

            // If no decode errors occurred, validate the decoded values
            if (!hasDecodeError) {
              decodedValues = decodedObject as typeof decodedValues;
              errors = Array.from(
                Value.Errors(schema as TSchema, decodedObject),
              );
            }
          }
        } else {
          // For non-object schemas, just get validation errors
          errors = Array.from(Value.Errors(schema as TSchema, cleanedValues));
        }
      }
    } else {
      errors = Array.from(
        schema instanceof TypeCheck
          ? schema.Errors(cleanedValues)
          : Value.Errors(schema as TSchema, cleanedValues),
      );
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    if (!errors.length) {
      return {
        errors: {},
        values: decodedValues as S extends TSchema
          ? Static<S> extends FieldValues
            ? StaticDecode<S>
            : FieldValues
          : FieldValues,
      };
    }

    return {
      values: {} as S extends TSchema
        ? Static<S> extends FieldValues
          ? StaticDecode<S>
          : FieldValues
        : FieldValues,
      errors: toNestErrors(
        parseErrorSchema(
          errors,
          !options.shouldUseNativeValidation && options.criteriaMode === 'all',
          schema instanceof TypeCheck ? undefined : (schema as TSchema),
          originalValues,
        ),
        options,
      ),
    };
  };
}
