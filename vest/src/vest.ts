import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { FieldError } from 'react-hook-form';
import promisify from 'vest/promisify';
import type { Resolver, VestErrors } from './types';

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

/**
 * Creates a resolver for react-hook-form using Vest validation
 * @param {Function} schema - The Vest validation schema
 * @param {Object} _ - Unused parameter
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {string} [resolverOptions.mode='async'] - Validation mode
 * @returns {Resolver} A resolver function compatible with react-hook-form
 * @example
 * const schema = vest.create((data) => {
 *   if (!data.name) {
 *     return 'Name is required';
 *   }
 * });
 *
 * useForm({
 *   resolver: vestResolver(schema)
 * });
 */
export const vestResolver: Resolver =
  (schema, _, resolverOptions = {}) =>
  async (values, context, options) => {
    const result =
      resolverOptions.mode === 'sync'
        ? schema(values, options.names, context)
        : await promisify(schema)(values, options.names, context);

    if (result.hasErrors()) {
      return {
        values: {},
        errors: toNestErrors(
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
