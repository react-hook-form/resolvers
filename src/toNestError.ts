import {
  set,
  get,
  FieldError,
  FieldErrors,
  Field,
  InternalFieldName,
} from 'react-hook-form';

export const toNestError = <TFieldValues>(
  errors: Record<string, FieldError>,
  fields: Record<InternalFieldName, Field['_f']>,
): FieldErrors<TFieldValues> => {
  const fieldErrors: FieldErrors<TFieldValues> = {};
  for (const path in errors) {
    const field = get(fields, path) as Field['_f'] | undefined;
    set(
      fieldErrors,
      path,
      Object.assign(errors[path], { ref: field && field.ref }),
    );
  }

  return fieldErrors;
};
