import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import Ajv, { DefinedError } from 'ajv';
import ajvErrors from 'ajv-errors';
import { appendErrors, FieldError } from 'react-hook-form';
import { Resolver } from './types';

const parseErrorSchema = (
  ajvErrors: DefinedError[],
  validateAllFieldCriteria: boolean,
) => {
  // Ajv will return empty instancePath when require error
  ajvErrors.forEach((error) => {
    if (error.keyword === 'required') {
      error.instancePath += '/' + error.params.missingProperty;
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
    const ajv = new Ajv({
      allErrors: true,
      validateSchema: true,
      ...schemaOptions,
    });

    ajvErrors(ajv);

    const validate = ajv.compile(
      Object.assign({ $async: resolverOptions?.mode === 'async' }, schema),
    );
    const valid = validate(values);

    if (!valid) {
      return {
        values: {},
        errors: toNestError(
          parseErrorSchema(
            validate.errors as DefinedError[],
            !options.shouldUseNativeValidation &&
              options.criteriaMode === 'all',
          ),
          options,
        ),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      values,
      errors: {},
    };
  };
