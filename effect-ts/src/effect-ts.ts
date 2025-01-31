import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Effect } from 'effect';

import { ArrayFormatter, decodeUnknown } from 'effect/ParseResult';
import { type FieldError, appendErrors } from 'react-hook-form';
import type { Resolver } from './types';

export const effectTsResolver: Resolver =
  (schema, config = { errors: 'all', onExcessProperty: 'ignore' }) =>
  (values, _, options) => {
    return decodeUnknown(
      schema,
      config,
    )(values).pipe(
      Effect.catchAll((parseIssue) =>
        Effect.flip(ArrayFormatter.formatIssue(parseIssue)),
      ),
      Effect.mapError((issues) => {
        const validateAllFieldCriteria =
          !options.shouldUseNativeValidation && options.criteriaMode === 'all';

        const errors = issues.reduce(
          (acc, error) => {
            const key = error.path.join('.');

            if (!acc[key]) {
              acc[key] = { message: error.message, type: error._tag };
            }

            if (validateAllFieldCriteria) {
              const types = acc[key].types;
              const messages = types && types[String(error._tag)];

              acc[key] = appendErrors(
                key,
                validateAllFieldCriteria,
                acc,
                error._tag,
                messages
                  ? ([] as string[]).concat(messages as string[], error.message)
                  : error.message,
              ) as FieldError;
            }

            return acc;
          },
          {} as Record<string, FieldError>,
        );

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
