import type { FieldErrors } from 'react-hook-form';
import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import type { Resolver } from './types';

const parseErrors = (errors: string[], parsedErrors: FieldErrors = {}) => {
  return errors.reduce((acc, error) => {
    const e = error.split(':');

    acc[e[0].slice(1)] = {
      message: e[1].trim(),
    };

    return acc;
  }, parsedErrors);
};

export const typanionResolver: Resolver =
  (validator, validatorOptions = {}) =>
  (values, _, options) => {
    const rawErrors: string[] = [];
    const isValid = validator(
      values,
      Object.assign(
        {},
        {
          errors: rawErrors,
        },
        validatorOptions,
      ),
    );
    const parsedErrors = parseErrors(rawErrors);

    if (isValid) {
      options.shouldUseNativeValidation &&
        validateFieldsNatively(parsedErrors, options);

      return { values, errors: {} as FieldErrors<any> };
    }

    return {
      values: {},
      errors: toNestError(parsedErrors, options) as FieldErrors<any>,
    };
  };
