import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { ValidationError } from 'computed-types';
import FunctionType from 'computed-types/lib/schema/FunctionType';
import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';

const isValidationError = (error: any): error is ValidationError =>
  error.errors != null;

function parseErrorSchema(computedTypesError: ValidationError) {
  const parsedErrors: FieldErrors = {};
  return (computedTypesError.errors || []).reduce((acc, error) => {
    acc[error.path.join('.')] = {
      type: error.error.name,
      message: error.error.message,
    };

    return acc;
  }, parsedErrors);
}

/**
 * Creates a resolver for react-hook-form using computed-types schema validation
 * @param {Schema} schema - The computed-types schema to validate against
 * @returns {Resolver<Type<typeof schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = Schema({
 *   name: string,
 *   age: number
 * });
 *
 * useForm({
 *   resolver: computedTypesResolver(schema)
 * });
 */
export function computedTypesResolver<
  Input extends FieldValues,
  Context,
  Output,
>(schema: FunctionType<Output, [Input]>): Resolver<Input, Context, Output> {
  return async (values, _, options) => {
    try {
      const data = await schema(values);

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        errors: {},
        values: data,
      };
    } catch (error: any) {
      if (isValidationError(error)) {
        return {
          values: {},
          errors: toNestErrors(parseErrorSchema(error), options),
        };
      }

      throw error;
    }
  };
}
