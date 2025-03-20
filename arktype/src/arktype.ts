import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { StandardSchemaV1 } from '@standard-schema/spec';
import { getDotPath } from '@standard-schema/utils';
import { FieldError, FieldValues, Resolver } from 'react-hook-form';

function parseErrorSchema(
  issues: readonly StandardSchemaV1.Issue[],
  validateAllFieldCriteria: boolean,
) {
  const errors: Record<string, FieldError> = {};

  for (let i = 0; i < issues.length; i++) {
    const error = issues[i];
    const path = getDotPath(error);

    if (path) {
      if (!errors[path]) {
        errors[path] = { message: error.message, type: '' };
      }

      if (validateAllFieldCriteria) {
        const types = errors[path].types || {};

        errors[path].types = {
          ...types,
          [Object.keys(types).length]: error.message,
        };
      }
    }
  }

  return errors;
}

export function arktypeResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions?: never,
  resolverOptions?: {
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function arktypeResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions: never | undefined,
  resolverOptions: {
    raw: true;
  },
): Resolver<Input, Context, Input>;

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
export function arktypeResolver<Input extends FieldValues, Context, Output>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions?: never,
  resolverOptions: {
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Input | Output> {
  return async (values: Input, _, options) => {
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
