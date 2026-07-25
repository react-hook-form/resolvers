import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { StandardSchemaV1 } from '@standard-schema/spec';
import { getDotPath } from '@standard-schema/utils';
import { FieldError, FieldValues, Resolver } from 'react-hook-form';

const schemaRootKey = Symbol('Schema root');

function appendErrorMessage(error: FieldError, message: string | undefined) {
  if (!message) {
    return;
  }

  error.message = error.message ? `${error.message}\n${message}` : message;
}

function appendErrorTypes(error: FieldError, types: FieldError['types']) {
  if (!types) {
    return;
  }

  const nextTypes = error.types || {};

  for (const message of Object.values(types)) {
    nextTypes[Object.keys(nextTypes).length] = message;
  }

  error.types = nextTypes;
}

function parseErrorSchema(
  issues: readonly StandardSchemaV1.Issue[],
  validateAllFieldCriteria: boolean,
) {
  const errors = new Map<string | typeof schemaRootKey, FieldError>();

  for (let i = 0; i < issues.length; i++) {
    const error = issues[i];
    const path = getDotPath(error) || schemaRootKey;
    const fieldError = errors.get(path);

    if (!fieldError) {
      errors.set(path, { message: error.message, type: '' });
    } else if (path === schemaRootKey) {
      // Root-level issues aren't tied to a single field, so there's no
      // natural "first" message to prefer the way there is for a field —
      // keep every one of them regardless of criteriaMode.
      appendErrorMessage(fieldError, error.message);
    }

    if (validateAllFieldCriteria) {
      const currentError = errors.get(path)!;
      const types = currentError.types || {};

      currentError.types = {
        ...types,
        [Object.keys(types).length]: error.message,
      };
    }
  }

  const fieldErrors: Record<string, FieldError> = {};

  for (const [path, error] of errors) {
    if (path !== schemaRootKey) {
      fieldErrors[path] = error;
    }
  }

  const rootError = errors.get(schemaRootKey);

  if (rootError) {
    if (fieldErrors.root) {
      appendErrorMessage(fieldErrors.root, rootError.message);
      appendErrorTypes(fieldErrors.root, rootError.types);
    } else {
      fieldErrors.root = rootError;
    }
  }

  return fieldErrors;
}

export function standardSchemaResolver<
  Input extends FieldValues,
  Context,
  Output,
>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions?: never,
  resolverOptions?: {
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function standardSchemaResolver<
  Input extends FieldValues,
  Context,
  Output,
>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions: never | undefined,
  resolverOptions: {
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form that validates data using a Standard Schema.
 *
 * @param {Schema} schema - The Standard Schema to validate against
 * @param {Object} resolverOptions - Options for the resolver
 * @param {boolean} [resolverOptions.raw=false] - Whether to return raw input values instead of parsed values
 * @returns {Resolver} A resolver function compatible with react-hook-form
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   name: z.string().min(2),
 *   age: z.number().min(18)
 * });
 *
 * useForm({
 *   resolver: standardSchemaResolver(schema)
 * });
 * ```
 */
export function standardSchemaResolver<
  Input extends FieldValues,
  Context,
  Output,
>(
  schema: StandardSchemaV1<Input, Output>,
  _schemaOptions?: never,
  resolverOptions: {
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Output | Input> {
  return async (values, _, options) => {
    let result = schema['~standard'].validate(values);
    if (result instanceof Promise) {
      result = await result;
    }

    if (result.issues) {
      const errors = parseErrorSchema(
        result.issues,
        !options.shouldUseNativeValidation && options.criteriaMode === 'all',
      );

      return {
        values: {},
        errors: toNestErrors(errors, options),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      values: resolverOptions.raw ? Object.assign({}, values) : result.value,
      errors: {},
    };
  };
}
