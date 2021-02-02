import { set, FieldError, FieldErrors } from 'react-hook-form';

export const toNestObject = <TFieldValues>(
  errors: Record<string, FieldError>,
): FieldErrors<TFieldValues> => {
  const fieldErrors: FieldErrors<TFieldValues> = {};
  for (const path in errors) {
    set(fieldErrors, path, errors[path]);
  }

  return fieldErrors;
};
