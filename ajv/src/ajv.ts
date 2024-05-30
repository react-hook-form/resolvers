import {
  toNestErrors,
  validateFieldsNatively,
  isObject,
} from '@hookform/resolvers';
import Ajv, { type ErrorObject } from 'ajv';
import ajvErrors from 'ajv-errors';
import { appendErrors, type FieldError } from 'react-hook-form';
import type { Resolver } from './types';

type RequiredParamError = {
  params: {
    missingProperty: string;
  };
};

/**
 * Get the error object for the required field when `errorMessage` keyword is used
 * @param errorParams The error params object
 * @returns `False` if there is no error object for the required field, otherwise the error object
 */
const findRequiredParamError = (
  errorParams: Record<string, unknown>,
): false | RequiredParamError => {
  let requiredParamError: unknown = false;

  if (!errorParams.errors || !Array.isArray(errorParams.errors)) {
    return false;
  }

  requiredParamError = errorParams.errors.find(
    (error: unknown) =>
      isObject<Record<string, unknown>>(error) && error.keyword === 'required',
  );

  if (
    requiredParamError &&
    isObject<Record<string, unknown>>(requiredParamError) &&
    requiredParamError.params &&
    isObject<Record<string, unknown>>(requiredParamError.params) &&
    requiredParamError.params.missingProperty
  ) {
    return requiredParamError as RequiredParamError;
  }

  return false;
};

const parseErrorSchema = (
  ajvErrors: ErrorObject[],
  validateAllFieldCriteria: boolean,
) => {
  // Ajv will return empty instancePath when require error
  ajvErrors.forEach((error) => {
    if (error.keyword === 'required') {
      error.instancePath += '/' + error.params.missingProperty;
    }

    if (error.keyword === 'errorMessage') {
      const requiredParamError = findRequiredParamError(error.params);

      if (requiredParamError) {
        error.instancePath += '/' + requiredParamError.params.missingProperty;
      }
    }
  });

  return ajvErrors.reduce<Record<string, FieldError>>((previous, error) => {
    // `/deepObject/data` -> `deepObject.data`
    const path = error.instancePath.substring(1).replace(/\//g, '.');

    if (!previous[path]) {
      previous[path] = {
        message: error.message,
        type: error.keyword,
      };
    }

    if (validateAllFieldCriteria) {
      const types = previous[path].types;
      const messages = types && types[error.keyword];

      previous[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        previous,
        error.keyword,
        messages
          ? ([] as string[]).concat(messages as string[], error.message || '')
          : error.message,
      ) as FieldError;
    }

    return previous;
  }, {});
};

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

    // If the data is valid and there are no errors
    return valid || !validate.errors
      ? { values, errors: {} }
      : {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              validate.errors,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };
  };
