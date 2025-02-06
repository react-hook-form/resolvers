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
