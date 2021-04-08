import type { Resolver } from './types';
import { plainToClass } from 'class-transformer';
import { validate, validateSync, ValidationError } from 'class-validator';
import { toNestError } from '@hookform/resolvers';

const getErrorMessages = (rawError: ValidationError): any => {
  const res =
    rawError.children && rawError.children.length > 0
      ? Object.fromEntries(
          rawError.children.map((child) => {
            return [child.property, getErrorMessages(child)];
          }),
        )
      : {
          message: Object.entries(rawError.constraints ?? {})?.[0]?.[1],
        };

  return res;
};

const parseErrors = (rawErrors: ValidationError[]) => {
  const errors = Object.fromEntries(
    rawErrors.map((rawError) => [
      rawError.property,
      getErrorMessages(rawError),
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
