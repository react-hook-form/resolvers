import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Schema } from 'effect';
import { ParseResult } from 'effect';
import * as Effect from 'effect/Effect';
import type { FieldErrors } from 'react-hook-form';
import type { Resolver } from './types';

export const effectTsResolver: Resolver =
  (schema, config = { errors: 'all', onExcessProperty: 'ignore' }) =>
  (values, _, options) => {
    return Schema.decodeUnknown(
      schema,
      config,
    )(values).pipe(
      Effect.catchTag('ParseError', (parseIssue) =>
        Effect.flip(ParseResult.ArrayFormatter.formatError(parseIssue)),
      ),
      Effect.mapError((issues) => {
        const errors = issues.reduce((acc, current) => {
          const key = current.path.join('.');
          acc[key] = { message: current.message, type: current._tag };
          return acc;
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
