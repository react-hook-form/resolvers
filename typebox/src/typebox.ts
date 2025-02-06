import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Static, Type } from '@sinclair/typebox';
import { TypeCheck } from '@sinclair/typebox/compiler';
import { Value, type ValueError } from '@sinclair/typebox/value';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';

function parseErrorSchema(
  _errors: ValueError[],
  validateAllFieldCriteria: boolean,
) {
  const errors: Record<string, FieldError> = {};
  for (; _errors.length; ) {
    const error = _errors[0];
    const { type, message, path } = error;
    const _path = path.substring(1).replace(/\//g, '.');

    if (!errors[_path]) {
      errors[_path] = { message, type: '' + type };
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types['' + type];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        '' + type,
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message,
      ) as FieldError;
    }

    _errors.shift();
  }

  return errors;
}

export function typeboxResolver<
  TFieldValues extends FieldValues,
  Schema extends ReturnType<typeof Type.Object<TFieldValues>>,
>(schema: Schema | TypeCheck<Schema>): Resolver<Static<Schema>> {
  return async (values, _, options) => {
    const errors = Array.from(
      schema instanceof TypeCheck
        ? schema.Errors(values)
        : Value.Errors(schema, values),
    );

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    if (!errors.length) {
      return {
        errors: {} as FieldErrors,
        values,
      };
    }

    return {
      values: {},
      errors: toNestErrors(
        parseErrorSchema(
          errors,
          !options.shouldUseNativeValidation && options.criteriaMode === 'all',
        ),
        options,
      ),
    };
  };
}
