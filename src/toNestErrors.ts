import {
  Field,
  FieldErrors,
  FieldValues,
  InternalFieldName,
  ResolverOptions,
  get,
  set,
} from 'react-hook-form';
import { validateFieldsNatively } from './validateFieldsNatively';

export const toNestErrors = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> => {
  options.shouldUseNativeValidation && validateFieldsNatively(errors, options);
  const fieldErrors = {} as FieldErrors<TFieldValues>;
  for (const path in errors) {
    const field = get(options.fields, path) as Field['_f'] | undefined;
    if (isNameInFieldArray(options.names || Object.keys(errors), path)) {
      const fieldArrayErrors = Object.assign(
        {},
        structuredClone(get(fieldErrors, path)),
      );
      const error = Object.assign(structuredClone(errors[path]) || {}, {
        ref: field && field.ref,
      });
      set(fieldArrayErrors, 'root', error);
      set(fieldErrors, path, fieldArrayErrors);
    } else {
      const error = Object.assign(
        structuredClone(errors[path]) || {},
        structuredClone(get(fieldErrors, path)),
        { ref: field && field.ref },
      );
      set(fieldErrors, path, error);
    }
  }
  return fieldErrors;
};

const isNameInFieldArray = (
  names: InternalFieldName[],
  name: InternalFieldName,
) => {
  const path = escapeBrackets(name);
  return names.some((n) => escapeBrackets(n).match(`^${path}\\.\\d+`));
};

/**
 * Escapes special characters in a string to be used in a regex pattern.
 * it removes the brackets from the string to match the `set` method.
 *
 * @param input - The input string to escape.
 * @returns The escaped string.
 */
function escapeBrackets(input: string): string {
  return input.replace(/\]|\[/g, '');
}
