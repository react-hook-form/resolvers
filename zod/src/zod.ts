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
import * as z3 from 'zod/v3';
import * as z4 from 'zod/v4/core';

const isZod3Error = (error: any): error is z3.ZodError => {
  return Array.isArray(error?.issues);
};
const isZod3Schema = (schema: any): schema is z3.ZodSchema => {
  return (
    '_def' in schema &&
    typeof schema._def === 'object' &&
    'typeName' in schema._def
  );
};
const isZod4Error = (error: any): error is z4.$ZodError => {
  // instanceof is safe in Zod 4 (uses Symbol.hasInstance)
  return error instanceof z4.$ZodError;
};
const isZod4Schema = (schema: any): schema is z4.$ZodType => {
  return '_zod' in schema && typeof schema._zod === 'object';
};

function parseZod3Issues(
  zodErrors: z3.ZodIssue[],
  validateAllFieldCriteria: boolean,
) {
  const errors: Record<string, FieldError> = {};
  for (; zodErrors.length; ) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join('.');

    if (!errors[_path]) {
      if ('unionErrors' in error) {
        const unionError = error.unionErrors[0].errors[0];

        errors[_path] = {
          message: unionError.message,
          type: unionError.code,
        };
      } else {
        errors[_path] = { message, type: code };
      }
    }

    if ('unionErrors' in error) {
      error.unionErrors.forEach((unionError) =>
        unionError.errors.forEach((e) => zodErrors.push(e)),
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

function parseZod4Issues(
  zodErrors: z4.$ZodIssue[],
  validateAllFieldCriteria: boolean,
) {
  const errors: Record<string, FieldError> = {};
  // const _zodErrors = zodErrors as z4.$ZodISsue; //
  for (; zodErrors.length; ) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join('.');

    if (!errors[_path]) {
      if (error.code === 'invalid_union' && error.errors.length > 0) {
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
      error.errors.forEach((unionError) =>
        unionError.forEach((e) => zodErrors.push(e)),
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

type RawResolverOptions = {
  mode?: 'async' | 'sync';
  raw: true;
};
type NonRawResolverOptions = {
  mode?: 'async' | 'sync';
  raw?: false;
};

// minimal interfaces to avoid asssignability issues between versions
interface Zod3Type<O = unknown, I = unknown> {
  _output: O;
  _input: I;
  _def: {
    typeName: string;
  };
}

// some type magic to make versions pre-3.25.0 still work
type IsUnresolved<T> = PropertyKey extends keyof T ? true : false;
type UnresolvedFallback<T, Fallback> = IsUnresolved<typeof z3> extends true
  ? Fallback
  : T;
type FallbackIssue = {
  code: string;
  message: string;
  path: (string | number)[];
};
type Zod3ParseParams = UnresolvedFallback<
  z3.ParseParams,
  // fallback if user is on <3.25.0
  {
    path?: (string | number)[];
    errorMap?: (
      iss: FallbackIssue,
      ctx: {
        defaultError: string;
        data: any;
      },
    ) => { message: string };
    async?: boolean;
  }
>;
type Zod4ParseParams = UnresolvedFallback<
  z4.ParseContext<z4.$ZodIssue>,
  // fallback if user is on <3.25.0
  {
    readonly error?: (
      iss: FallbackIssue,
    ) => null | undefined | string | { message: string };
    readonly reportInput?: boolean;
    readonly jitless?: boolean;
  }
>;

export function zodResolver<Input extends FieldValues, Context, Output>(
  schema: Zod3Type<Output, Input>,
  schemaOptions?: Zod3ParseParams,
  resolverOptions?: NonRawResolverOptions,
): Resolver<Input, Context, Output>;
export function zodResolver<Input extends FieldValues, Context, Output>(
  schema: Zod3Type<Output, Input>,
  schemaOptions: Zod3ParseParams | undefined,
  resolverOptions: RawResolverOptions,
): Resolver<Input, Context, Input>;
// the Zod 4 overloads need to be generic for complicated reasons
export function zodResolver<
  Input extends FieldValues,
  Context,
  Output,
  T extends z4.$ZodType<Output, Input> = z4.$ZodType<Output, Input>,
>(
  schema: T,
  schemaOptions?: Zod4ParseParams, // already partial
  resolverOptions?: NonRawResolverOptions,
): Resolver<z4.input<T>, Context, z4.output<T>>;
export function zodResolver<
  Input extends FieldValues,
  Context,
  Output,
  T extends z4.$ZodType<Output, Input> = z4.$ZodType<Output, Input>,
>(
  schema: z4.$ZodType<Output, Input>,
  schemaOptions: Zod4ParseParams | undefined, // already partial
  resolverOptions: RawResolverOptions,
): Resolver<z4.input<T>, Context, z4.input<T>>;
/**
 * Creates a resolver function for react-hook-form that validates form data using a Zod schema
 * @param {z3.ZodSchema<Input>} schema - The Zod schema used to validate the form data
 * @param {Partial<z3.ParseParams>} [schemaOptions] - Optional configuration options for Zod parsing
 * @param {Object} [resolverOptions] - Optional resolver-specific configuration
 * @param {('async'|'sync')} [resolverOptions.mode='async'] - Validation mode. Use 'sync' for synchronous validation
 * @param {boolean} [resolverOptions.raw=false] - If true, returns the raw form values instead of the parsed data
 * @returns {Resolver<z3.output<typeof schema>>} A resolver function compatible with react-hook-form
 * @throws {Error} Throws if validation fails with a non-Zod error
 * @example
 * const schema = z3.object({
 *   name: z3.string().min(2),
 *   age: z3.number().min(18)
 * });
 *
 * useForm({
 *   resolver: zodResolver(schema)
 * });
 */
export function zodResolver<Input extends FieldValues, Context, Output>(
  schema: object,
  schemaOptions?: object,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Output | Input> {
  if (isZod3Schema(schema)) {
    return async (values: Input, _, options) => {
      try {
        const data = await schema[
          resolverOptions.mode === 'sync' ? 'parse' : 'parseAsync'
        ](values, schemaOptions);

        options.shouldUseNativeValidation &&
          validateFieldsNatively({}, options);

        return {
          errors: {} as FieldErrors,
          values: resolverOptions.raw ? Object.assign({}, values) : data,
        } satisfies ResolverSuccess<Output | Input>;
      } catch (error) {
        if (isZod3Error(error)) {
          return {
            values: {},
            errors: toNestErrors(
              parseZod3Issues(
                error.errors,
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

  if (isZod4Schema(schema)) {
    return async (values: Input, _, options) => {
      try {
        const parseFn =
          resolverOptions.mode === 'sync' ? z4.parse : z4.parseAsync;
        const data: any = await parseFn(schema, values, schemaOptions);

        options.shouldUseNativeValidation &&
          validateFieldsNatively({}, options);

        return {
          errors: {} as FieldErrors,
          values: resolverOptions.raw ? Object.assign({}, values) : data,
        } satisfies ResolverSuccess<Output | Input>;
      } catch (error) {
        if (isZod4Error(error)) {
          return {
            values: {},
            errors: toNestErrors(
              parseZod4Issues(
                error.issues,
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

  throw new Error('Invalid input: not a Zod schema');
}
