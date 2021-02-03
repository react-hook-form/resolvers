import { FieldError } from 'react-hook-form';
import { toNestError } from '@hookform/resolvers';

import { StructError, validate } from 'superstruct';
import { Resolver } from './types';

const parseErrorSchema = (error: StructError) =>
  error.failures().reduce<Record<string, FieldError>>(
    (previous, error) =>
      (previous[error.path.join('.')] = {
        message: error.message,
        type: error.type,
      }) && previous,
    {},
  );

export const superstructResolver: Resolver = (schema, resolverOptions) => (
  values,
  _,
  options,
) => {
  const result = validate(values, schema, resolverOptions);

  return {
    values: result[1] || {},
    errors: result[0]
      ? toNestError(parseErrorSchema(result[0]), options.fields)
      : {},
  };
};
