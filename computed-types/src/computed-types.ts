import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Type, ValidationError } from 'computed-types';
import FunctionType from 'computed-types/lib/schema/FunctionType';
import type { FieldErrors, Resolver } from 'react-hook-form';

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

export function computedTypesResolver<Schema extends FunctionType<any, any>>(
  schema: Schema,
): Resolver<Type<typeof schema>> {
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
