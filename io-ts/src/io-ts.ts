import * as Either from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/function';
import { toNestError } from '@hookform/resolvers';
import errorsToRecord from './errorsToRecord';
import { Resolver } from './types';

export const ioTsResolver: Resolver = (codec) => (values, _context, options) =>
  pipe(
    values,
    codec.decode,
    Either.mapLeft(errorsToRecord(options.criteriaMode === 'all')),
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
