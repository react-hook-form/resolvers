import { get, FieldError, ResolverOptions } from 'react-hook-form';

// Native validation (web only)
export const validateFieldsNatively = <TFieldValues>(
  errors: Record<string, FieldError>,
  options: ResolverOptions<TFieldValues>,
): void => {
  for (const fieldPath in options.fields) {
    const field = options.fields[fieldPath];

    if (field && field.ref && 'reportValidity' in field.ref) {
      const error = get(errors, fieldPath) as FieldError | undefined;

      field.ref.setCustomValidity((error && error.message) || '');

      field.ref.reportValidity();
    }
  }
};
