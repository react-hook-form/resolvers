import type { FieldErrors } from 'react-hook-form';
import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import type { Resolver } from './types';

const parseErrors = (
  errors: string[],
  parsedErrors: FieldErrors = {},
  _path = '',
) => {
  return errors.reduce((acc, error) => {
    const [_key, _message] = error.split(':')
    const key = _key.slice(1)
    const message = _message.trim()

    acc[key] = {
      message,
    };

    return acc;
  }, parsedErrors);
};

export const typanionResolver: Resolver =
  (validator, validatorOptions = {}) =>
    (values, _, options) => {
      const rawErrors: string[] = []
      const isValid = validator(values, {errors: rawErrors, ...validatorOptions})
      const parsedErrors = parseErrors(rawErrors)

      if (!isValid) {
        return { values: {}, errors: toNestError(parsedErrors, options) };
      }

      options.shouldUseNativeValidation && validateFieldsNatively(parsedErrors, options);

      return { values, errors: {} };
    };