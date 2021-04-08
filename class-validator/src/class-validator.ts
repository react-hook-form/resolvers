import type { Resolver } from './types';
import { plainToClass } from 'class-transformer';
import { validate, validateSync, ValidationError } from 'class-validator';
import { toNestError } from '@hookform/resolvers';
import { FieldError } from 'react-hook-form';

const parseErrors = (
  rawErrors: ValidationError[],
): Record<string, FieldError> => {
  const errors = Object.fromEntries(
    rawErrors.map((rawError) => [
      rawError.property,
      {
        message: Object.entries(rawError.constraints ?? {})[0][1],
      } as FieldError,
    ]),
  );
  return rawErrors.length > 0 ? errors : {};
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
