import * as Either from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/function';
import { toNestError, validateFieldsNatively } from '@hookform/resolvers';
import errorsToRecord from './errorsToRecord';
import { Resolver } from './types';
import { FieldErrors } from 'react-hook-form';

export const ioTsResolver: Resolver = (codec) => (values, _context, options) =>
  pipe(
    values,
    codec.decode,
    Either.mapLeft(
      errorsToRecord(
        !options.shouldUseNativeValidation && options.criteriaMode === 'all',
      ),
    ),
    Either.mapLeft((errors) => toNestError(errors, options)),
    Either.fold(
      (errors) => ({
        values: {},
        errors,
      }),
      (values) => {
        options.shouldUseNativeValidation &&
          validateFieldsNatively({}, options);

        return {
          values,
          errors: {} as FieldErrors<any>,
        };
      },
    ),
  );
