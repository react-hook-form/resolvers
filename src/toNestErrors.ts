import {
  get,
  FieldErrors,
  Field,
  ResolverOptions,
  FieldValues,
  InternalFieldName,
} from 'react-hook-form';
import { dset } from 'dset';
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
      const fieldArrayErrors = Object.assign({}, get(fieldErrors, path));

      dset(fieldArrayErrors, 'root', error);
      dset(fieldErrors, path, fieldArrayErrors);
    } else {
      dset(fieldErrors, path, error);
    }
  }

  return fieldErrors;
};

const isNameInFieldArray = (
  names: InternalFieldName[],
  name: InternalFieldName,
) => names.some((n) => n.startsWith(name + '.'));
