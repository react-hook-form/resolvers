import {
  FieldError,
  FieldErrors,
  FieldValues,
  Ref,
  ResolverOptions,
  get,
} from 'react-hook-form';

const setCustomValidity = (
  ref: Ref,
  fieldPath: string,
  errors: FieldErrors,
  shouldReport: boolean = true,
) => {
  if (ref && 'reportValidity' in ref) {
    const error = get(errors, fieldPath) as FieldError | undefined;
    ref.setCustomValidity((error && error.message) || '');

    if (shouldReport) {
      if ('focus' in ref && typeof (ref as any).focus === 'function') {
        (ref as any).focus();
      }
      ref.reportValidity();
    }
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
      setCustomValidity(field.ref, fieldPath, errors, false);
    } else if (field && field.refs) {
      field.refs.forEach((ref: HTMLInputElement) =>
        setCustomValidity(ref, fieldPath, errors, false),
      );
    }
  }

  const ordered = Array.isArray((options as any).names)
    ? ((options as any).names as string[])
    : Object.keys(options.fields);

  const firstErrorPath = ordered.find((name) => Boolean(get(errors, name)));
  if (!firstErrorPath) {
    return;
  }

  const firstField = options.fields[firstErrorPath];
  const firstRef: Ref | undefined =
    firstField?.ref ??
    (Array.isArray((firstField as any)?.refs)
      ? (firstField as any).refs[0]
      : undefined);

  if (!firstRef) {
    return;
  }

  setCustomValidity(firstRef, firstErrorPath, errors, true);
};
