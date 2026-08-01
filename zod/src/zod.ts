import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import {
  FieldError,
  FieldValues,
  Resolver,
  ResolverError,
  ResolverSuccess,
  appendErrors,
} from 'react-hook-form';
// Type-only: these subpaths don't exist before zod@3.25.0, so importing them
// as values would break resolution for anyone on an older zod 3.x. `import
// type` is fully erased at build time, so the compiled output never
// references these subpaths at runtime — see `isZod4Error` below for how the
// one runtime check that used to need `z4.$ZodError` avoids that now.
import type * as z3 from 'zod/v3';
import type * as z4 from 'zod/v4/core';

const isZod3Error = (error: any): error is z3.ZodError => {
  return Array.isArray(error?.issues);
};
const isZod3Schema = (schema: any): schema is z3.ZodSchema => {
  // Deliberately doesn't require `typeName` in `_def` — dynamically selected
  // schemas typed via the generic `z.ZodType<Output>` annotation (rather than
  // a concrete subclass like `ZodObject`) don't statically expose `typeName`,
  // even though they're genuine Zod 3 schema instances at runtime.
  return '_def' in schema && typeof schema._def === 'object';
};
const isZod4Error = (error: any): error is z4.$ZodError => {
  // Replicates zod4's own `$ZodError`/`Symbol.hasInstance` check
  // (`inst?._zod?.traits?.has(name)`, see zod's `$constructor` in
  // `v4/core/core.ts`) by hand rather than importing `$ZodError` as a value,
  // since that import only exists in zod@3.25.0+ (see the `import type` note
  // above).
  return !!error?._zod?.traits?.has('$ZodError');
};
const isZod4Schema = (schema: any): schema is z4.$ZodType => {
  return '_zod' in schema && typeof schema._zod === 'object';
};

function parseZod3Issues(
  zodErrors: z3.ZodIssue[],
  validateAllFieldCriteria: boolean,
) {
  // A null-prototype object avoids false-positive hits from inherited
  // members (e.g. `toString`, `constructor`, `__proto__`) when a field is
  // named after one of them — a plain `{}` would make `!errors[_path]`
  // truthy-skip those paths and silently drop their errors.
  const errors: Record<string, FieldError> = Object.create(null);
  for (; zodErrors.length; ) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join('.');

    if (!errors[_path]) {
      if ('unionErrors' in error) {
        // Surface the error from whichever union member came closest to
        // matching (fewest issues), rather than always the first member —
        // the first member isn't necessarily the one the input was meant for.
        const closestUnionError = error.unionErrors.reduce(
          (closest, current) =>
            current.errors.length < closest.errors.length ? current : closest,
        );
        // Fall back to the union issue's own message/code if the closest
        // member somehow has no issues of its own (shouldn't happen, but
        // avoids ever throwing on an unexpected/malformed union shape).
        const unionError = closestUnionError.errors[0];

        errors[_path] = {
          message: unionError?.message ?? message,
          type: unionError?.code ?? code,
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
  // See the matching comment in `parseZod3Issues` above.
  const errors: Record<string, FieldError> = Object.create(null);
  // const _zodErrors = zodErrors as z4.$ZodISsue; //
  for (; zodErrors.length; ) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join('.');

    if (!errors[_path]) {
      if (error.code === 'invalid_union' && error.errors.length > 0) {
        // Surface the error from whichever union member came closest to
        // matching (fewest issues), rather than always the first member —
        // the first member isn't necessarily the one the input was meant for.
        const closestBranch = error.errors.reduce((closest, branch) =>
          branch.length < closest.length ? branch : closest,
        );
        // Fall back to the union issue's own message/code if the closest
        // branch somehow has no issues of its own (shouldn't happen — a
        // 0-issue branch means that branch matched — but this guarantees we
        // never throw on an unexpected/malformed union shape, e.g. a "no
        // matching discriminator" issue nested in a way we haven't seen).
        const unionError = closestBranch[0];

        errors[_path] = {
          message: unionError?.message ?? message,
          type: unionError?.code ?? code,
        };
      } else {
        errors[_path] = { message, type: code };
      }
    }

    if (error.code === 'invalid_union') {
      error.errors.forEach((unionError) =>
        unionError.forEach((e) =>
          zodErrors.push({ ...e, path: [...error.path, ...e.path] }),
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
  _def: object;
}

// minimal interface to avoid assignability issues between zod v4 patch/minor
// releases, which brand the full `$ZodType` shape with an exact version literal
// (e.g. `_zod.version.minor`)
interface Zod4Type<Output = unknown, Input = unknown> {
  _zod: {
    output: Output;
    input: Input;
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
  T extends Zod4Type<Output, Input> = Zod4Type<Output, Input>,
>(
  schema: T,
  schemaOptions?: Zod4ParseParams, // already partial
  resolverOptions?: NonRawResolverOptions,
): Resolver<z4.input<T>, Context, z4.output<T>>;
export function zodResolver<
  Input extends FieldValues,
  Context,
  Output,
  T extends Zod4Type<Output, Input> = Zod4Type<Output, Input>,
>(
  schema: Zod4Type<Output, Input>,
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
  // Zod 4 is checked first: its `_zod` marker is unambiguous, whereas the
  // Zod 3 check below only requires an object-shaped `_def` (to support
  // dynamically-selected schemas typed via the generic `z.ZodType<Output>`
  // annotation, see `isZod3Schema`) — and Zod 4 schemas also have an
  // object-shaped `_def`, so they'd otherwise be misdetected as Zod 3.
  if (isZod4Schema(schema)) {
    return async (values: Input, _, options) => {
      try {
        // Call the schema's own bound `parse`/`parseAsync` method rather
        // than the standalone `z4.parse`/`z4.parseAsync` functions. Those
        // standalone functions read from this module's own imported
        // `zod/v4/core`, which — under bundlers that can resolve `zod` and
        // `zod/v4/core` to two distinct module instances (e.g. Metro with
        // package-exports resolution enabled) — may not be the same zod
        // instance the schema was created with, silently dropping any
        // global config (`z.config()`) or locale the app configured on its
        // own zod instance. The schema's own method is always bound to
        // whichever zod instance actually created it.
        const classicSchema = schema as unknown as {
          parse: (values: unknown, schemaOptions: unknown) => unknown;
          parseAsync: (
            values: unknown,
            schemaOptions: unknown,
          ) => Promise<unknown>;
        };
        const data: any =
          resolverOptions.mode === 'sync'
            ? classicSchema.parse(values, schemaOptions)
            : await classicSchema.parseAsync(values, schemaOptions);

        options.shouldUseNativeValidation &&
          validateFieldsNatively({}, options);

        return {
          errors: {},
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

  if (isZod3Schema(schema)) {
    return async (values: Input, _, options) => {
      try {
        const data = await schema[
          resolverOptions.mode === 'sync' ? 'parse' : 'parseAsync'
        ](values, schemaOptions);

        options.shouldUseNativeValidation &&
          validateFieldsNatively({}, options);

        return {
          errors: {},
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

  throw new Error('Invalid input: not a Zod schema');
}
