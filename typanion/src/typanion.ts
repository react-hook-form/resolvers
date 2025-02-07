import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
} from 'react-hook-form';
import * as t from 'typanion';

function parseErrors(errors: string[], parsedErrors: FieldErrors = {}) {
  return errors.reduce((acc, error) => {
    const fieldIndex = error.indexOf(':');

    const field = error.slice(1, fieldIndex);
    const message = error.slice(fieldIndex + 1).trim();

    acc[field] = {
      message,
    } as FieldError;

    return acc;
  }, parsedErrors);
}

/**
 * Creates a resolver for react-hook-form using Typanion schema validation
 * @param {t.StrictValidator<TFieldValues, TFieldValues>} schema - The Typanion schema to validate against
 * @param {Pick<t.ValidationState, 'coercions' | 'coercion'>} [schemaOptions] - Optional Typanion validation options
 * @returns {Resolver<t.InferType<typeof schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = t.isObject({
 *   name: t.isString(),
 *   age: t.isInteger()
 * });
 *
 * useForm({
 *   resolver: typanionResolver(schema)
 * });
 */
export function typanionResolver<TFieldValues extends FieldValues>(
  schema: t.StrictValidator<TFieldValues, TFieldValues>,
  schemaOptions: Pick<t.ValidationState, 'coercions' | 'coercion'> = {},
): Resolver<t.InferType<typeof schema>> {
  return (values, _, options) => {
    const rawErrors: string[] = [];
    const isValid = schema(
      values,
      Object.assign(
        {},
        {
          errors: rawErrors,
        },
        schemaOptions,
      ),
    );
    const parsedErrors = parseErrors(rawErrors);

    if (isValid) {
      options.shouldUseNativeValidation &&
        validateFieldsNatively(parsedErrors, options);

      return { values, errors: {} };
    }

    return { values: {}, errors: toNestErrors(parsedErrors, options) };
  };
}
