import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import Ajv, { DefinedError } from 'ajv';
import { appendErrors, FieldError } from 'react-hook-form';
import { Resolver } from './types';

const parseErrorSchema = (
  ajvErrors: DefinedError[],
  validateAllFieldCriteria: boolean,
) => {
  // eslint-disable-next-line no-console
  console.log('ajvErrors', ajvErrors);
  // eslint-disable-next-line no-console
  console.log('validateAllFieldCriteria', validateAllFieldCriteria);
  return ajvErrors.reduce<Record<string, FieldError>>((previous, error) => {
    if (!previous[error.schemaPath]) {
      previous[error.schemaPath] = {
        message: error.message,
        type: error.keyword,
      };
    }

    if (validateAllFieldCriteria) {
      const types = previous[error.schemaPath].types;
      const messages = types && types[error.keyword];

      previous[error.schemaPath] = appendErrors(
        error.schemaPath,
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

    const validate = ajv.compile(
      Object.assign({ $async: resolverOptions?.mode === 'async' }, schema),
    );
    const valid = await validate(values);

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
