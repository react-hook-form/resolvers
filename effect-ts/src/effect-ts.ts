import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Effect, Schema } from 'effect';
import { ArrayFormatter, decodeUnknown } from 'effect/ParseResult';
import { ParseOptions } from 'effect/SchemaAST';
import {
  type FieldError,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';

export function effectTsResolver<Input extends FieldValues, Context, Output>(
  schema: Schema.Schema<Output, Input>,
  schemaOptions?: ParseOptions,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function effectTsResolver<Input extends FieldValues, Context, Output>(
  schema: Schema.Schema<Output, Input>,
  schemaOptions: ParseOptions | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form using Effect.ts schema validation
 * @param {Schema.Schema<TFieldValues, I>} schema - The Effect.ts schema to validate against
 * @param {ParseOptions} [schemaOptions] - Optional Effect.ts validation options
 * @returns {Resolver<Schema.Schema.Type<typeof schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Number
 * });
 *
 * useForm({
 *   resolver: effectTsResolver(schema)
 * });
 */
export function effectTsResolver<Input extends FieldValues, Context, Output>(
  schema: Schema.Schema<Output, Input>,
  schemaOptions: ParseOptions = { errors: 'all', onExcessProperty: 'ignore' },
): Resolver<Input, Context, Output | Input> {
  return (values, _, options) => {
    return decodeUnknown(
      schema,
      schemaOptions,
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
}
