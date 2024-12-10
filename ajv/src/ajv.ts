import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import Ajv, { DefinedError } from 'ajv';
import ajvErrors from 'ajv-errors';
import { FieldError, appendErrors } from 'react-hook-form';
import { AjvError, Resolver } from './types';

// Ajv will return empty instancePath when require error
const setRequiredErrorInstancePath = (error: DefinedError) => {
  if (error.keyword === 'required') {
    error.instancePath += `/${error.params.missingProperty}`;
  }
};

const parseErrorSchema = (
  ajvErrors: AjvError[],
  validateAllFieldCriteria: boolean,
) => {
  const normalizedErrors: AjvError[] = [];

  ajvErrors.forEach((error) => {
    if (error.keyword === 'errorMessage') {
      error.params.errors.forEach((originalError) => {
        if (originalError.emUsed) {
          setRequiredErrorInstancePath(originalError);
          originalError.message = error.message;
          normalizedErrors.push(originalError);
        }
      });
    } else {
      setRequiredErrorInstancePath(error);
      normalizedErrors.push(error);
    }
  });

  return normalizedErrors.reduce<Record<string, FieldError>>(
    (previous, error) => {
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
    },
    {},
  );
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
