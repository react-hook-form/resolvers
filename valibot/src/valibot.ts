import { toNestErrors } from '@hookform/resolvers';
import {
  FieldError,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';
import { getDotPath, safeParseAsync } from 'valibot';
import {
  BaseSchema,
  BaseSchemaAsync,
  Config,
  InferIssue,
  InferOutput,
} from 'valibot';

export function valibotResolver<TFieldValues extends FieldValues>(
  schema:
    | BaseSchema<TFieldValues, TFieldValues, any>
    | BaseSchemaAsync<TFieldValues, TFieldValues, any>,
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
): Resolver<InferOutput<typeof schema>> {
  return async (values, _, options) => {
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
