import type { Resolver } from './types';
import { plainToClass } from 'class-transformer';
import { validate, validateSync, ValidationError } from 'class-validator';
import { FieldErrors } from 'react-hook-form';
import { toNestError } from '@hookform/resolvers';

const parseErrors = (
  errors: ValidationError[],
  parsedErrors: FieldErrors = {},
  path = '',
) => {
  return errors.reduce((acc, error) => {
    const _path = path ? `${path}.${error.property}` : error.property;

    if (error.constraints) {
      const [key, message] = Object.entries(error.constraints)[0];

      acc[_path] = {
        type: key,
        message,
      };
    }

    if (error.children?.length) {
      parseErrors(error.children, acc, `${_path}`);
    }

    return acc;
  }, parsedErrors);
};

export const classValidatorResolver: Resolver = (
  schema,
  schemaOptions = {},
  resolverOptions = {},
) => async (values, _, options) => {
  const user = plainToClass(schema, values);
  const rawErrors =
    resolverOptions.mode === 'sync'
      ? validateSync(user, schemaOptions)
      : await validate(user, schemaOptions);

  if (rawErrors.length === 0) {
    return { values, errors: {} };
  }

  const errors = toNestError(parseErrors(rawErrors), options.fields);
  return { values: {}, errors };
};
