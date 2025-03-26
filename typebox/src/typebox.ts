import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { Static, StaticDecode, TObject } from '@sinclair/typebox';
import { TypeCheck } from '@sinclair/typebox/compiler';
import { Value, type ValueError } from '@sinclair/typebox/value';
import { FieldError, Resolver, appendErrors } from 'react-hook-form';

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

/**
 * Creates a resolver for react-hook-form using Typebox schema validation
 * @param {Schema | TypeCheck<Schema>} schema - The Typebox schema to validate against
 * @param {Object} options - Additional resolver configuration
 * @param {string} [options.mode='async'] - Validation mode
 * @returns {Resolver<Static<Schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = Type.Object({
 *   name: Type.String(),
 *   age: Type.Number()
 * });
 *
 * useForm({
 *   resolver: typeboxResolver(schema)
 * });
 */
export function typeboxResolver<Schema extends TObject, Context>(
  schema: Schema | TypeCheck<Schema>,
): Resolver<Static<Schema>, Context, StaticDecode<Schema>> {
  return async (values: Static<Schema>, _, options) => {
    const errors = Array.from(
      schema instanceof TypeCheck
        ? schema.Errors(values)
        : Value.Errors(schema, values),
    );

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    if (!errors.length) {
      return {
        errors: {},
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
