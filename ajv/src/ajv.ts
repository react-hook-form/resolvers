import Ajv from 'ajv';
import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
// import { appendErrors, FieldError } from 'react-hook-form';
import { Resolver } from './types';

const parseErrorSchema = () => {
  return {};
};

export const ajvResolver: Resolver =
  (schema) => async (values, context, options) => {
    try {
      const ajv = new Ajv({
        allErrors: true,
        validateSchema: true,
        ...context,
      });

      ajv.validate(schema, values);

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        values,
        errors: {},
      };
    } catch (e: any) {
      return {
        values: {},
        errors: toNestError(parseErrorSchema(), options),
      };
    }
  };
