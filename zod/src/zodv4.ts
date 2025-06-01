import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverError,
  ResolverSuccess,
  appendErrors,
} from 'react-hook-form';
import { ZodError } from 'zod-v4/v4';
import * as core from 'zod-v4/v4/core';

function parseErrorSchema(
  zodErrors: core.$ZodIssue[],
  validateAllFieldCriteria: boolean,
) {
  const errors: Record<string, FieldError> = {};
  for (; zodErrors.length; ) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join('.');

    if (!errors[_path]) {
      if (error.code === 'invalid_union') {
        const unionError = error.errors[0][0];

        errors[_path] = {
          message: unionError.message,
          type: unionError.code,
        };
      } else {
        errors[_path] = { message, type: code };
      }
    }

    if (error.code === 'invalid_union') {
      error.errors.forEach((unionError: any[]) =>
        unionError.forEach((e) =>
          zodErrors.push({
            ...e,
            path: [...path, ...e.path],
          }),
        ),
      );
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types[error.code];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        code,
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message,
      ) as FieldError;
    }

    zodErrors.shift();
  }

  return errors;
}

export function zodResolver<Input extends FieldValues, Context, Output>(
  schema: core.$ZodType<Output, Input>,
  schemaOptions?: Partial<core.ParseContext<core.$ZodIssue>>,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;

/**
 * Creates a resolver function for react-hook-form that validates form data using a Zod schema
 * @param {z.ZodSchema<Input>} schema - The Zod schema used to validate the form data
 * @param {Partial<z.ParseParams>} [schemaOptions] - Optional configuration options for Zod parsing
 * @param {Object} [resolverOptions] - Optional resolver-specific configuration
 * @param {('async'|'sync')} [resolverOptions.mode='async'] - Validation mode. Use 'sync' for synchronous validation
 * @param {boolean} [resolverOptions.raw=false] - If true, returns the raw form values instead of the parsed data
 * @returns {Resolver<z.output<typeof schema>>} A resolver function compatible with react-hook-form
 * @throws {Error} Throws if validation fails with a non-Zod error
 * @example
 * const schema = z.object({
 * @param {z.core.ParseContext<z.core.$ZodIssue>} [schemaOptions] - Optional configuration options for Zod parsing *   age: z.number().min(18)
 * });
 *
 * useForm({
 *   resolver: zodResolver(schema)
 * });
 */
export function zodResolver<Input extends FieldValues, Context, Output>(
  schema: core.$ZodType<Output, Input>,
  schemaOptions?: Partial<core.ParseContext<core.$ZodIssue>>,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Output | Input> {
  return async (values: Input, _, options) => {
    try {
      const data = await (resolverOptions.mode === 'sync'
        ? core.parse(schema, values, schemaOptions)
        : core.parseAsync(schema, values, schemaOptions));

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        errors: {} as FieldErrors,
        values: resolverOptions.raw ? values : data,
      } satisfies ResolverSuccess<Output | Input>;
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          values: {} as Input,
          errors: toNestErrors(
            parseErrorSchema(
              (error as { issues: core.$ZodIssue[] }).issues,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        } satisfies ResolverError<Input>;
      }

      throw error;
    }
  };
}
