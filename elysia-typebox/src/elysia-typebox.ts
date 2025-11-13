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
import { FieldError, Resolver, appendErrors } from 'react-hook-form';

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
  let current: any = schema;

  for (const segment of segments) {
    if (current[Kind] === 'Object' && 'properties' in current) {
      current = current.properties[segment];
    } else if (current[Kind] === 'Array' && 'items' in current) {
      current = current.items;
    } else {
      return undefined;
    }
    if (!current) {
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
      return String((result as any).message);
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
                .reduce((obj: any, key) => obj?.[key], originalValues);

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
// Helper type to ensure the schema produces an object
type EnsureObject<T> = T extends Record<string, unknown> ? T : never;

export function elysiaTypeboxResolver<
  Schema extends TSchema,
  Context = unknown,
>(
  schema: Schema | TypeCheck<Schema>,
): Resolver<EnsureObject<Static<Schema>>, Context, StaticDecode<Schema>> {
  return async (values, _, options) => {
    const originalValues = values;
    let decodedValues = values;
    let errors: ValueError[] = [];

    if (!(schema instanceof TypeCheck) && hasTransform(schema)) {
      try {
        decodedValues = Value.Decode(schema, values);
        errors = [];
      } catch (e) {
        if (schema[Kind] === 'Object' && 'properties' in schema) {
          for (const [key, propSchema] of Object.entries(
            schema.properties as Record<string, TSchema>,
          )) {
            if (hasTransform(propSchema)) {
              try {
                Value.Decode(propSchema, (values as any)[key]);
              } catch (decodeError) {
                errors = [
                  {
                    type: 0,
                    schema: propSchema,
                    path: `/${key}`,
                    value: (values as any)[key],
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
        }

        if (!errors.length) {
          errors = Array.from(Value.Errors(schema, values));
        }
      }
    } else {
      errors = Array.from(
        schema instanceof TypeCheck
          ? schema.Errors(values)
          : Value.Errors(schema, values),
      );
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    if (!errors.length) {
      return {
        errors: {},
        values: decodedValues,
      };
    }

    return {
      values: {},
      errors: toNestErrors(
        parseErrorSchema(
          errors,
          !options.shouldUseNativeValidation && options.criteriaMode === 'all',
          schema instanceof TypeCheck ? undefined : schema,
          originalValues,
        ),
        options,
      ),
    };
  };
}
