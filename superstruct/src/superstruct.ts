import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { FieldError, FieldValues, Resolver } from 'react-hook-form';
import { Infer, Struct, StructError, validate } from 'superstruct';

function parseErrorSchema(error: StructError) {
  return error.failures().reduce<Record<string, FieldError>>(
    (previous, error) =>
      (previous[error.path.join('.')] = {
        message: error.message,
        type: error.type,
      }) && previous,
    {},
  );
}

/**
 * Creates a resolver for react-hook-form using Superstruct schema validation
 * @param {Struct<TFieldValues, any>} schema - The Superstruct schema to validate against
 * @param {Parameters<typeof validate>[2]} [schemaOptions] - Optional Superstruct validation options
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {boolean} [resolverOptions.raw=false] - If true, returns raw values rather than validated results
 * @returns {Resolver<Infer<typeof schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = struct({
 *   name: string(),
 *   age: number()
 * });
 *
 * useForm({
 *   resolver: superstructResolver(schema)
 * });
 */
export function superstructResolver<TFieldValues extends FieldValues>(
  schema: Struct<TFieldValues, any>,
  schemaOptions?: Parameters<typeof validate>[2],
  resolverOptions: {
    raw?: boolean;
  } = {},
): Resolver<Infer<typeof schema>> {
  return (values, _, options) => {
    const result = validate(values, schema, schemaOptions);

    if (result[0]) {
      return {
        values: {},
        errors: toNestErrors(parseErrorSchema(result[0]), options),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      values: resolverOptions.raw ? Object.assign({}, values) : result[1],
      errors: {},
    };
  };
}
