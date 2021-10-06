import {
  set,
  get,
  FieldError,
  FieldErrors,
  Field,
  ResolverOptions,
} from 'react-hook-form';
import { validateFieldsNatively } from './validateFieldsNatively';

export const toNestError = <TFieldValues>(
  errors: Record<string, FieldError>,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> => {
  options.shouldUseNativeValidation && validateFieldsNatively(errors, options);

  const fieldErrors = {} as FieldErrors<TFieldValues>;
  for (const path in errors) {
    const field = get(options.fields, path) as Field['_f'] | undefined;

    set(
      fieldErrors,
      path,
      Object.assign(errors[path], { ref: field && field.ref }),
    );
  }

  return fieldErrors;
};
