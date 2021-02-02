import { toNestObject } from '@hookform/resolvers';
import { FieldError } from 'react-hook-form';

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

export const superstructResolver: Resolver = (schema, options) => (values) => {
  const result = validate(values, schema, options);

  return {
    values: result[1] || {},
    errors: result[0] ? toNestObject(parseErrorSchema(result[0])) : {},
  };
};
