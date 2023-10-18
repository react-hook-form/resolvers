import { get } from 'react-hook-form/utils';
import type {
  FieldError,
  ResolverOptions,
  Ref,
  FieldErrors,
  FieldValues,
} from 'react-hook-form';

const setCustomValidity = (
  ref: Ref,
  fieldPath: string,
  errors: FieldErrors,
) => {
  if (ref && 'reportValidity' in ref) {
    const error = get(errors, fieldPath) as FieldError | undefined;
    ref.setCustomValidity((error && error.message) || '');

    ref.reportValidity();
  }
};

// Native validation (web only)
export const validateFieldsNatively = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>,
): void => {
  for (const fieldPath in options.fields) {
    const field = options.fields[fieldPath];
    if (field && field.ref && 'reportValidity' in field.ref) {
      setCustomValidity(field.ref, fieldPath, errors);
    } else if (field.refs) {
      field.refs.forEach((ref: HTMLInputElement) =>
        setCustomValidity(ref, fieldPath, errors),
      );
    }
  }
};
