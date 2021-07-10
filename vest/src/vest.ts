import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import { FieldError } from 'react-hook-form';
import promisify from 'vest/promisify';
import type { VestErrors, Resolver } from './types';

const parseErrorSchema = (
  vestError: VestErrors,
  validateAllFieldCriteria: boolean,
) => {
  const errors: Record<string, FieldError> = {};
  for (const path in vestError) {
    if (!errors[path]) {
      errors[path] = { message: vestError[path][0], type: '' };
    }

    if (validateAllFieldCriteria) {
      errors[path].types = vestError[path].reduce<Record<number, string>>(
        (acc, message, index) => (acc[index] = message) && acc,
        {},
      );
    }
  }
  return errors;
};

export const vestResolver: Resolver =
  (schema, _, resolverOptions = {}) =>
  async (values, _context, options) => {
    const result =
      resolverOptions.mode === 'sync'
        ? schema(values)
        : await promisify(schema)(values);

    if (result.hasErrors()) {
      return {
        values: {},
        errors: toNestError(
          parseErrorSchema(
            result.getErrors(),
            !options.shouldUseNativeValidation &&
              options.criteriaMode === 'all',
          ),
          options,
        ),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return { values, errors: {} };
  };
