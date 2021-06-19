import {
  set,
  get,
  FieldError,
  FieldErrors,
  Field,
  ResolverOptions,
} from 'react-hook-form';

export const toNestError = <TFieldValues>(
  errors: Record<string, FieldError>,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> => {
  const fieldErrors: FieldErrors<TFieldValues> = {};
  for (const path in errors) {
    const field = get(options.fields, path) as Field['_f'] | undefined;

    // Native validation (web only)
    if (
      options.shouldUseNativeValidation &&
      field &&
      'reportValidity' in field.ref
    ) {
      field.ref.setCustomValidity(errors[path].message || '');
      field.ref.reportValidity();
    }

    set(
      fieldErrors,
      path,
      Object.assign(errors[path], { ref: field && field.ref }),
    );
  }

  return fieldErrors;
};
