import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import * as Either from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import { FieldValues, Resolver } from 'react-hook-form';
import errorsToRecord from './errorsToRecord';

export function ioTsResolver<
  T extends Record<string, any>,
  TFieldValues extends FieldValues,
>(schema: t.Type<TFieldValues, T>): Resolver<t.OutputOf<typeof schema>> {
  return (values, _context, options) =>
    pipe(
      values,
      schema.decode,
      Either.mapLeft(
        errorsToRecord(
          !options.shouldUseNativeValidation && options.criteriaMode === 'all',
        ),
      ),
      Either.mapLeft((errors) => toNestErrors(errors, options)),
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
            errors: {},
          };
        },
      ),
    );
}
