import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { StandardSchemaV1 } from '@standard-schema/spec';
import { FieldError, FieldValues, Resolver } from 'react-hook-form';

function parseIssues(
  issues: readonly StandardSchemaV1.Issue[],
  validateAllFieldCriteria: boolean,
) {
  const errors: Record<string, FieldError> = {};

  for (let i = 0; i < issues.length; i++) {
    const error = issues[i];
    const path = error.path?.join('.');

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

/**
 * Creates a resolver for react-hook-form that validates data using a Standard Schema.
 *
 * @param {Schema} schema - The Standard Schema to validate against
 * @param {Object} resolverOptions - Options for the resolver
 * @param {boolean} [resolverOptions.raw=false] - Whether to return raw input values instead of parsed values
 * @returns {Resolver} A resolver function compatible with react-hook-form
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   name: z.string().min(2),
 *   age: z.number().min(18)
 * });
 *
 * useForm({
 *   resolver: standardSchemaResolver(schema)
 * });
 * ```
 */
export function standardSchemaResolver<
  TFieldValues extends FieldValues,
  Schema extends StandardSchemaV1<TFieldValues, any>,
>(
  schema: Schema,
  resolverOptions: {
    raw?: boolean;
  } = {},
): Resolver<NonNullable<(typeof schema)['~standard']['types']>['output']> {
  return async (values: TFieldValues, _, options) => {
    let result = schema['~standard'].validate(values);
    if (result instanceof Promise) {
      result = await result;
    }

    if (result.issues) {
      const errors = parseIssues(
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
