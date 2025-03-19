import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import * as Either from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import {
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverError,
  ResolverSuccess,
} from 'react-hook-form';
import errorsToRecord, { ErrorObject } from './errorsToRecord';

export function ioTsResolver<Input extends FieldValues, Context, Output>(
  schema: t.Type<Output, Input>,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function ioTsResolver<Input extends FieldValues, Context, Output>(
  schema: t.Type<Output, Input>,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form using io-ts schema validation
 * @param {t.Type<TFieldValues, T>} schema - The io-ts schema to validate against
 * @param {Object} options - Additional resolver configuration
 * @param {string} [options.mode='async'] - Validation mode
 * @returns {Resolver<t.OutputOf<typeof schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = t.type({
 *   name: t.string,
 *   age: t.number
 * });
 *
 * useForm({
 *   resolver: ioTsResolver(schema)
 * });
 */
export function ioTsResolver<Input extends FieldValues, Context, Output>(
  schema: t.Type<Output, Input>,
): Resolver<Input, Context, Input | Output> {
  return (values, _context, options) =>
    pipe(
      values,
      schema.decode,
      Either.mapLeft(
        errorsToRecord(
          !options.shouldUseNativeValidation && options.criteriaMode === 'all',
        ),
      ),
      Either.mapLeft((errors: ErrorObject) =>
        toNestErrors<Input>(errors, options),
      ),
      Either.fold<
        FieldErrors<Input>,
        Output,
        ResolverError<Input> | ResolverSuccess<Output | Input>
      >(
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
