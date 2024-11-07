import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Effect, ParseResult } from 'effect';
import { decodeUnknown } from 'effect/Schema';
import type { FieldErrors } from 'react-hook-form';
import type { Resolver } from './types';

export const effectTsResolver: Resolver =
  (schema, config = { errors: 'all', onExcessProperty: 'ignore' }) =>
  (values, _, options) =>
    decodeUnknown(
      schema,
      config,
    )(values).pipe(
      Effect.catchAll((parseError) =>
        Effect.flip(ParseResult.TreeFormatter.formatIssue(parseError.issue)),
      ),
      Effect.mapError((issues: any) => {
        const errors = (issues as any[]).reduce((acc: any, current: any) => {
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
