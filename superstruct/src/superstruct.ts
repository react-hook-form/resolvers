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

export function superstructResolver<TFieldValues extends FieldValues>(
  schema: Struct<TFieldValues, any>,
  schemaOptions?: Parameters<typeof validate>[2],
  resolverOptions: {
    /**
     * Return the raw input values rather than the parsed values.
     * @default false
     */
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
