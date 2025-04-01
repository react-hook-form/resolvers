import { toNestErrors } from '@hookform/resolvers';
import {
  FieldError,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';
import { getDotPath, safeParseAsync } from 'valibot';
import { BaseSchema, BaseSchemaAsync, Config, InferIssue } from 'valibot';

export function valibotResolver<Input extends FieldValues, Context, Output>(
  schema: BaseSchema<Input, Output, any> | BaseSchemaAsync<Input, Output, any>,
  schemaOptions?: Partial<
    Omit<Config<InferIssue<typeof schema>>, 'abortPipeEarly' | 'skipPipe'>
  >,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function valibotResolver<Input extends FieldValues, Context, Output>(
  schema: BaseSchema<Input, Output, any> | BaseSchemaAsync<Input, Output, any>,
  schemaOptions:
    | Partial<
        Omit<Config<InferIssue<typeof schema>>, 'abortPipeEarly' | 'skipPipe'>
      >
    | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form using Valibot schema validation
 * @param {BaseSchema<TFieldValues, TFieldValues, any> | BaseSchemaAsync<TFieldValues, TFieldValues, any>} schema - The Valibot schema to validate against
 * @param {Partial<Omit<Config<InferIssue<typeof schema>>, 'abortPipeEarly' | 'skipPipe'>>} [schemaOptions] - Optional Valibot validation options
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {('sync' | 'async')} [resolverOptions.mode] - Validation mode
 * @param {boolean} [resolverOptions.raw] - If true, returns raw values rather than validated results
 * @returns {Resolver<InferOutput<typeof schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = valibot.object({
 *   name: valibot.string().minLength(2),
 *   age: valibot.number().min(18)
 * });
 *
 * useForm({
 *   resolver: valibotResolver(schema)
 * });
 */
export function valibotResolver<Input extends FieldValues, Context, Output>(
  schema: BaseSchema<Input, Output, any> | BaseSchemaAsync<Input, Output, any>,
  schemaOptions?: Partial<
    Omit<Config<InferIssue<typeof schema>>, 'abortPipeEarly' | 'skipPipe'>
  >,
  resolverOptions: {
    /**
     * @default async
     */
    mode?: 'sync' | 'async';
    /**
     * Return the raw input values rather than the parsed values.
     * @default false
     */
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Output | Input> {
  return async (values: Input, _, options) => {
    // Check if we should validate all field criteria
    const validateAllFieldCriteria =
      !options.shouldUseNativeValidation && options.criteriaMode === 'all';

    // Parse values with Valibot schema
    const result = await safeParseAsync(
      schema,
      values,
      Object.assign({}, schemaOptions, {
        abortPipeEarly: !validateAllFieldCriteria,
      }),
    );

    // If there are issues, return them as errors
    if (result.issues) {
      // Create errors object
      const errors: Record<string, FieldError> = {};

      // Iterate over issues to add them to errors object
      for (; result.issues.length; ) {
        const issue = result.issues[0];
        // Create dot path from issue
        const path = getDotPath(issue);

        if (path) {
          // Add first error of path to errors object
          if (!errors[path]) {
            errors[path] = { message: issue.message, type: issue.type };
          }

          // If configured, add all errors of path to errors object
          if (validateAllFieldCriteria) {
            const types = errors[path].types;
            const messages = types && types[issue.type];
            errors[path] = appendErrors(
              path,
              validateAllFieldCriteria,
              errors,
              issue.type,
              messages
                ? ([] as string[]).concat(
                    messages as string | string[],
                    issue.message,
                  )
                : issue.message,
            ) as FieldError;
          }
        }

        result.issues.shift();
      }

      // Return resolver result with errors
      return {
        values: {},
        errors: toNestErrors(errors, options),
      } as const;
    }

    // Otherwise, return resolver result with values
    return {
      values: resolverOptions.raw
        ? Object.assign({}, values)
        : (result.output as FieldValues),
      errors: {},
    };
  };
}
