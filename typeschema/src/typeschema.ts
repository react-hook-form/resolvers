import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';
import { StandardSchemaV1 } from 'zod/lib/standard-schema';

const parseErrorSchema = (
  typeschemaErrors: readonly StandardSchemaV1.Issue[],
  validateAllFieldCriteria: boolean,
): FieldErrors => {
  const schemaErrors = Object.assign([], typeschemaErrors);
  const errors: Record<string, FieldError> = {};

  for (; schemaErrors.length; ) {
    const error = typeschemaErrors[0];

    if (!error.path) {
      continue;
    }
    const _path = error.path.join('.');

    if (!errors[_path]) {
      errors[_path] = { message: error.message, type: '' };
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types[''];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        '',
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message,
      ) as FieldError;
    }

    schemaErrors.shift();
  }

  return errors;
};

export function typeschemaResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions?: never,
  resolverOptions?: {
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function typeschemaResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions: never | undefined,
  resolverOptions: {
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form using TypeSchema validation
 * @param {any} schema - The TypeSchema to validate against
 * @param {any} _ - Unused parameter
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {string} [resolverOptions.mode='async'] - Validation mode
 * @returns {Resolver} A resolver function compatible with react-hook-form
 * @example
 * const schema = z.object({
 *   name: z.string().required(),
 *   age: z.number().required(),
 * });
 *
 * useForm({
 *   resolver: typeschemaResolver(schema)
 * });
 */
export function typeschemaResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions?: never,
  resolverOptions: {
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Output | Input> {
  return async (values, _, options) => {
    let result = schema['~standard'].validate(values);
    if (result instanceof Promise) {
      result = await result;
    }

    if (result.issues) {
      const errors = parseErrorSchema(
        result.issues,
        !options.shouldUseNativeValidation && options.criteriaMode === 'all',
      );

      return {
        values: {},
        errors: toNestErrors(errors, options),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      values: resolverOptions.raw ? Object.assign({}, values) : result.value,
      errors: {},
    };
  };
}
