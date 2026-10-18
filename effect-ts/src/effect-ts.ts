import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Effect, Schema, SchemaIssue } from 'effect';
import type { ParseOptions } from 'effect/SchemaAST';
import {
  type FieldError,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';

type Issue = { path: PropertyKey[]; message: string; type: string };

const formatIssue = SchemaIssue.makeFormatterStandardSchemaV1();

// Flattens the issue tree like `makeFormatterStandardSchemaV1` does, but keeps
// the `_tag` of the failing node so it can be reported as the error `type`.
const flattenIssue = (
  issue: SchemaIssue.Issue,
  path: PropertyKey[],
): Issue[] => {
  switch (issue._tag) {
    case 'Pointer':
      return flattenIssue(issue.issue, [...path, ...issue.path]);
    case 'Encoding':
      return flattenIssue(issue.issue, path);
    case 'Composite':
    case 'AnyOf':
      if (issue.issues.length) {
        return issue.issues.flatMap((issue) => flattenIssue(issue, path));
      }
  }

  return formatIssue(issue).issues.map((error) => ({
    path: [...path, ...(error.path || [])] as PropertyKey[],
    message: error.message,
    type: issue._tag,
  }));
};

export function effectTsResolver<Input extends FieldValues, Context, Output>(
  schema: Schema.Codec<Output, Input, never, unknown>,
  schemaOptions?: ParseOptions,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function effectTsResolver<Input extends FieldValues, Context, Output>(
  schema: Schema.Codec<Output, Input, never, unknown>,
  schemaOptions: ParseOptions | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form using Effect Schema validation
 * @param {Schema.Codec<Output, Input>} schema - The Effect schema to validate against
 * @param {ParseOptions} [schemaOptions] - Optional Effect Schema parse options
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
  schema: Schema.Codec<Output, Input, never, unknown>,
  schemaOptions: ParseOptions = { errors: 'all', onExcessProperty: 'ignore' },
): Resolver<Input, Context, Output | Input> {
  return (values, _, options) =>
    Schema.decodeUnknownEffect(schema)(values, schemaOptions).pipe(
      Effect.match({
        onFailure: ({ issue }) => {
          const validateAllFieldCriteria =
            !options.shouldUseNativeValidation &&
            options.criteriaMode === 'all';

          // A null-prototype accumulator avoids false-positive hits from
          // inherited members (e.g. `toString`, `constructor`) when a field
          // is named after one of them — a plain `{}` would make `!acc[key]`
          // truthy-skip those paths and silently drop their errors.
          const errors = flattenIssue(issue, []).reduce(
            (acc, error) => {
              const key = error.path.join('.');

              if (!acc[key]) {
                acc[key] = { message: error.message, type: error.type };
              }

              if (validateAllFieldCriteria) {
                const types = acc[key].types;
                const messages = types && types[error.type];

                acc[key] = appendErrors(
                  key,
                  validateAllFieldCriteria,
                  acc,
                  error.type,
                  messages
                    ? ([] as string[]).concat(
                        messages as string[],
                        error.message,
                      )
                    : error.message,
                ) as FieldError;
              }

              return acc;
            },
            Object.create(null) as Record<string, FieldError>,
          );

          return { errors: toNestErrors(errors, options), values: {} };
        },
        onSuccess: (result) => {
          options.shouldUseNativeValidation &&
            validateFieldsNatively({}, options);

          return { errors: {}, values: result };
        },
      }),
      Effect.runPromise,
    );
}
