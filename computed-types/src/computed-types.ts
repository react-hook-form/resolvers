import type { FieldErrors } from 'react-hook-form';
import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import type { ValidationError } from 'computed-types';
import type { Resolver } from './types';

const parseErrorSchema = (computedTypesError: ValidationError) => {
  const parsedErrors: FieldErrors = {};
  return (computedTypesError.errors || []).reduce((acc, error) => {
    acc[error.path.join('.')] = {
      type: error.error.name,
      message: error.error.message,
    };

    return acc;
  }, parsedErrors);
};

export const computedTypesResolver: Resolver =
  (schema) => async (values, _, options) => {
    try {
      const data = await schema(values);

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        errors: {},
        values: data,
      };
    } catch (error: any) {
      return {
        values: {},
        errors: toNestError(parseErrorSchema(error), options),
      };
    }
  };
