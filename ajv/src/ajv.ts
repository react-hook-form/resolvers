import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import ajvErrors from 'ajv-errors';
import { appendErrors, FieldError } from 'react-hook-form';
import { Resolver } from './types';

const parseErrorSchema = (
  ajvErrors: ErrorObject[],
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
  (schema, schemaOptions, { mode = 'async', transform } = {}) =>
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
      Object.assign({ $async: mode === 'async' }, schema),
    );

    const result = await validateByMode(
      validate,
      transform ? transform(values) : values,
      mode,
    );

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return result.valid
      ? { values, errors: {} }
      : {
          values: {},
          errors: toNestError(
            parseErrorSchema(
              result.errors,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };
  };

async function validateByMode(
  validate: ValidateFunction,
  values: Record<string, any>,
  mode: 'sync' | 'async',
) {
  let valid = false;
  let errors: ErrorObject[] = [];
  if (mode === 'sync') {
    valid = validate(values);
    errors = validate.errors ?? [];
  } else {
    try {
      await validate(values);
      valid = true;
    } catch (err) {
      if (!(err instanceof Ajv.ValidationError)) {
        throw err;
      }

      errors = err.errors as ErrorObject[];
    }
  }

  return { valid, errors };
}
