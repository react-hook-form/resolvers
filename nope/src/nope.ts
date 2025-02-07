import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import type { ShapeErrors } from 'nope-validator/lib/cjs/types';
import type { FieldError, FieldErrors } from 'react-hook-form';
import type { Resolver } from './types';

const parseErrors = (
  errors: ShapeErrors,
  parsedErrors: FieldErrors = {},
  path = '',
) => {
  return Object.keys(errors).reduce((acc, key) => {
    const _path = path ? `${path}.${key}` : key;
    const error = errors[key];

    if (typeof error === 'string') {
      acc[_path] = {
        message: error,
      } as FieldError;
    } else {
      parseErrors(error, acc, _path);
    }

    return acc;
  }, parsedErrors);
};

/**
 * Creates a resolver for react-hook-form using Nope schema validation
 * @param {NopeSchema} schema - The Nope schema to validate against
 * @param {NopeSchemaOptions} [schemaOptions] - Optional Nope validation options
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {string} [resolverOptions.mode='async'] - Validation mode
 * @returns {Resolver<NopeSchema>} A resolver function compatible with react-hook-form
 * @example
 * const schema = nope.object({
 *   name: nope.string().required(),
 *   age: nope.number().required()
 * });
 *
 * useForm({
 *   resolver: nopeResolver(schema)
 * });
 */
export const nopeResolver: Resolver =
  (
    schema,
    schemaOptions = {
      abortEarly: false,
    },
  ) =>
  (values, context, options) => {
    const result = schema.validate(values, context, schemaOptions) as
      | ShapeErrors
      | undefined;

    if (result) {
      return { values: {}, errors: toNestErrors(parseErrors(result), options) };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return { values, errors: {} };
  };
