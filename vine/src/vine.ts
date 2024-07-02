import { appendErrors, FieldError, FieldErrors } from 'react-hook-form';
import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { SimpleErrorReporter, errors } from '@vinejs/vine';
import type { Resolver } from './types';

const parseErrorSchema = (
  vineErrors: SimpleErrorReporter['errors'],
  validateAllFieldCriteria: boolean,
) => {
  const schemaErrors: Record<string, FieldError> = {};

  for (const error of vineErrors) {
    const { field, rule, message } = error;
    const path = field;

    if (!(path in schemaErrors)) {
      schemaErrors[path] = { message, type: rule };
    }

    if (validateAllFieldCriteria) {
      const { types } = schemaErrors[path];
      const messages = types && types[rule];

      schemaErrors[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        schemaErrors,
        rule,
        messages ? [...(messages as string[]), message] : message,
      ) as FieldError;
    }
  }

  return schemaErrors;
};

export const vineResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    try {
      const data = await schema.validate(values, schemaOptions);

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        errors: {} as FieldErrors,
        values: resolverOptions.raw ? values : data,
      };
    } catch (error: any) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              error.messages,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };
      }

      throw error;
    }
  };
