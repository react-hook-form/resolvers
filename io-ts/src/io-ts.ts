import * as Either from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/function';
import { toNestError } from '@hookform/resolvers';
import errorsToRecord from './errorsToRecord';
import { Resolver } from './types';

export const ioTsResolver: Resolver = (codec) => (values, _context, options) =>
  pipe(
    values,
    codec.decode,
    Either.mapLeft((errors) =>
      options.criteriaMode === 'firstError' || !options.criteriaMode
        ? [errors[0]]
        : errors,
    ),
    errorsToRecord,
    Either.mapLeft((errors) => toNestError(errors, options.fields)),

    Either.fold(
      (errors) => ({
        values: {},
        errors,
      }),
      (values) => ({
        values,
        errors: {},
      }),
    ),
  );
