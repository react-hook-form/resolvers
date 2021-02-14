import Yup from 'yup';
import { toNestError } from '@hookform/resolvers';
import { appendErrors, FieldError } from 'react-hook-form';
import { Resolver } from './types';

/**
 * Why `path!` ? because it could be `undefined` in some case
 * https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
 */
const parseErrorSchema = (
  error: Yup.ValidationError,
  validateAllFieldCriteria: boolean,
) => {
  return error.inner.reduce<Record<string, FieldError>>((previous, error) => {
    if (!previous[error.path!]) {
      previous[error.path!] = { message: error.message, type: error.type! };
    }

    if (validateAllFieldCriteria) {
      previous[error.path!] = appendErrors(
        error.path!,
        validateAllFieldCriteria,
        previous,
        error.type!,
        error.message,
      ) as FieldError;
    }

    return previous;
  }, {});
};

export const yupResolver: Resolver = (
  schema,
  schemaOptions = {
    abortEarly: false,
  },
  resolverOptions = {},
) => async (values, context, options) => {
  try {
    if (schemaOptions.context && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        "You should not used the yup options context. Please, use the 'useForm' context object instead",
      );
    }

    const result = await schema[
      resolverOptions.mode === 'sync' ? 'validateSync' : 'validate'
    ](values, Object.assign({}, schemaOptions, { context }));

    return {
      values: result,
      errors: {},
    };
  } catch (e) {
    return {
      values: {},
      errors: toNestError(
        parseErrorSchema(e, options.criteriaMode === 'all'),
        options.fields,
      ),
    };
  }
};
