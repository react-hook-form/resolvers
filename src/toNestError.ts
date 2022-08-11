import {
  set,
  get,
  FieldErrors,
  Field,
  ResolverOptions,
} from 'react-hook-form';
import { validateFieldsNatively } from './validateFieldsNatively';

export const toNestError = <TFieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> => {
  options.shouldUseNativeValidation && validateFieldsNatively(errors, options);

  const entries = Object.entries(errors)
      .sort(([leftPath], [rightPath]) => {
        if (leftPath === rightPath) {
          return 0;
        }

        return leftPath > rightPath ? 1 : -1
      });

  const fieldErrors = {} as FieldErrors<TFieldValues>;
  for (let index = 0; index < entries.length; index++) {
    const path = entries[index][0];
    const error = entries[index][1];
    const field = get(options.fields, path) as Field['_f'] | undefined;

    set(
        fieldErrors,
        path,
        Object.assign(error, {ref: field && field.ref}),
    );
  }

  return fieldErrors;
};
