import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import Ajv, { DefinedError } from 'ajv';
import ajvErrors from 'ajv-errors';
import { FieldError, appendErrors } from 'react-hook-form';
import { AjvError, Resolver } from './types';

const parseErrorSchema = (
  ajvErrors: AjvError[],
  validateAllFieldCriteria: boolean,
) => {
  const parsedErrors: Record<string, FieldError> = {};

  const reduceError = (error: AjvError) => {
    // Ajv will return empty instancePath when require error
    if (error.keyword === 'required') {
      error.instancePath += `/${error.params.missingProperty}`;
    }

    // `/deepObject/data` -> `deepObject.data`
    const path = error.instancePath.substring(1).replace(/\//g, '.');

    if (!parsedErrors[path]) {
      parsedErrors[path] = {
        message: error.message,
        type: error.keyword,
      };
    }

    if (validateAllFieldCriteria) {
      const types = parsedErrors[path].types;
      const messages = types && types[error.keyword];

      parsedErrors[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        parsedErrors,
        error.keyword,
        messages
          ? ([] as string[]).concat(messages as string[], error.message || '')
          : error.message,
      ) as FieldError;
    }
  };

  for (let index = 0; index < ajvErrors.length; index += 1) {
    const error = ajvErrors[index];

    if (error.keyword === 'errorMessage') {
      error.params.errors.forEach((originalError) => {
        originalError.message = error.message;
        reduceError(originalError);
      });
    } else {
      reduceError(error);
    }
  }

  return parsedErrors;
};

/**
 * Creates a resolver for react-hook-form using Ajv schema validation
 * @param {Schema} schema - The Ajv schema to validate against
 * @param {Object} schemaOptions - Additional schema validation options
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {string} [resolverOptions.mode='async'] - Validation mode
 * @returns {Resolver<Schema>} A resolver function compatible with react-hook-form
 * @example
 * const schema = ajv.compile({
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string' },
 *     age: { type: 'number' }
 *   }
 * });
 *
 * useForm({
 *   resolver: ajvResolver(schema)
 * });
 */
export const ajvResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    const ajv = new Ajv(
      Object.assign(
        {},
        {
          allErrors: true,
          validateSchema: true,
        },
        schemaOptions,
      ),
    );

    ajvErrors(ajv);

    const validate = ajv.compile(
      Object.assign(
        { $async: resolverOptions && resolverOptions.mode === 'async' },
        schema,
      ),
    );

    const valid = validate(values);

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return valid
      ? { values, errors: {} }
      : {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              validate.errors as DefinedError[],
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };
  };
