import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { ArkErrors, Type } from 'arktype';
import { FieldError, FieldErrors, Resolver } from 'react-hook-form';

function parseErrorSchema(arkErrors: ArkErrors): Record<string, FieldError> {
  const errors = [...arkErrors];
  const fieldsErrors: Record<string, FieldError> = {};

  for (; errors.length; ) {
    const error = errors[0];
    const _path = error.path.join('.');

    if (!fieldsErrors[_path]) {
      fieldsErrors[_path] = { message: error.message, type: error.code };
    }

    errors.shift();
  }

  return fieldsErrors;
}

/**
 * Creates a resolver for react-hook-form using Arktype schema validation
 * @param {Schema} schema - The Arktype schema to validate against
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {string} [resolverOptions.mode='raw'] - Return the raw input values rather than the parsed values
 * @returns {Resolver<Schema['inferOut']>} A resolver function compatible with react-hook-form
 * @example
 * const schema = type({
 *   username: 'string>2'
 * });
 *
 * useForm({
 *   resolver: arktypeResolver(schema)
 * });
 */
export function arktypeResolver<Schema extends Type<any, any>>(
  schema: Schema,
  _schemaOptions?: never,
  resolverOptions: {
    raw?: boolean;
  } = {},
): Resolver<Schema['inferOut']> {
  return (values, _, options) => {
    const out = schema(values);

    if (out instanceof ArkErrors) {
      return {
        values: {},
        errors: toNestErrors(parseErrorSchema(out), options),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      errors: {} as FieldErrors,
      values: resolverOptions.raw ? Object.assign({}, values) : out,
    };
  };
}
