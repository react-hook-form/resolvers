import { Schema } from '@effect/schema';
import { formatErrorSync } from '@effect/schema/ArrayFormatter';
import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Effect, pipe } from 'effect';
import type { FieldErrors } from 'react-hook-form';
import { Resolver } from './types';

export const effectTsResolver: Resolver =
  (schema, config = { errors: 'all', onExcessProperty: 'ignore' }) =>
  (values, _, options) => {
    return pipe(
      values,
      Schema.decodeUnknownEither(schema, config),
      Effect.mapError(formatErrorSync),
      Effect.mapError((issues) => {
        const errors = issues.reduce((acc, current) => {
          const key = current.path.join('.');
          return {
            ...acc,
            [key]: { message: current.message, type: current._tag },
          };
        }, {} as FieldErrors);

        return toNestErrors(errors, options);
      }),
      Effect.tap(() =>
        Effect.sync(
          () =>
            options.shouldUseNativeValidation &&
            validateFieldsNatively({}, options),
        ),
      ),
      Effect.match({
        onFailure: (errors) => ({ errors, values: {} }),
        onSuccess: (result) => ({ errors: {}, values: result }),
      }),
      Effect.runPromise,
    );
  };
