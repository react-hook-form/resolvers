import {
  get, FieldError, ResolverOptions, Ref
} from 'react-hook-form';

const setCustomValidity = (ref: Ref, fieldPath: string, errors: Record<string, FieldError>) => {
  if (ref && 'reportValidity' in ref) {
    const error = get(errors, fieldPath) as FieldError | undefined;
    ref.setCustomValidity((error && error.message) || '');

    ref.reportValidity();
  }
};

// Native validation (web only)
export const validateFieldsNatively = <TFieldValues>(
  errors: Record<string, FieldError>,
  options: ResolverOptions<TFieldValues>,
): void => {


  for (const fieldPath in options.fields) {
    const field = options.fields[fieldPath];
    if (field && field.ref && 'reportValidity' in field.ref) {
      setCustomValidity(field.ref, fieldPath, errors)
    } else if (field.refs) {
      field.refs.forEach((ref: HTMLInputElement) => setCustomValidity(ref, fieldPath, errors))
    }
  }
};
