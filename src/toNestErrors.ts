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
    const error = Object.assign(errors[path] || {}, {
      ref: field && field.ref,
    });

    if (isNameInFieldArray(options.names || Object.keys(errors), path)) {
      const fieldArrayErrors = Object.assign({}, get(fieldErrors, path));

      set(fieldArrayErrors, 'root', error);
      set(fieldErrors, path, fieldArrayErrors);
    } else {
      set(fieldErrors, path, error);
    }
  }

  return fieldErrors;
};

const isNameInFieldArray = (
  names: InternalFieldName[],
  name: InternalFieldName,
) => {
  const path = escapeForRegex(name);
  return names.some((n) => escapeBrackets(n).match(`^${path}\\.\\d+`));
};

// Removes brackets to match react-hook-form's `set` method behavior.
function escapeBrackets(input: string): string {
  return input.replace(/[\[\]]/g, '');
}

// Removes brackets then escapes regex metacharacters so a field name can be
// safely embedded in a regex pattern without causing a SyntaxError.
function escapeForRegex(input: string): string {
  return escapeBrackets(input).replace(/[.*+?^${}()|\\]/g, '\\$&');
}
