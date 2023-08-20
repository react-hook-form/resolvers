import {
  set,
  get,
  FieldErrors,
  Field,
  ResolverOptions,
  FieldValues,
  InternalFieldName,
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
      const fieldArrayErrors = Object.assign(
        {},
        compact(get(fieldErrors, path)),
      );

      set(fieldArrayErrors, 'root', error);
      set(fieldErrors, path, fieldArrayErrors);
    } else {
      set(fieldErrors, path, error);
    }
  }

  return fieldErrors;
};

const compact = <TValue>(value: TValue[]) =>
  Array.isArray(value) ? value.filter(Boolean) : [];

const isNameInFieldArray = (
  names: InternalFieldName[],
  name: InternalFieldName,
) => names.some((n) => n.startsWith(name + '.'));
