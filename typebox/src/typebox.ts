import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { FieldError, Resolver, appendErrors } from 'react-hook-form';
import type { Static, StaticDecode, TObject, TProperties } from 'typebox';
import { Validator } from 'typebox/compile';
import type { TLocalizedValidationError } from 'typebox/error';
import { Locale } from 'typebox/system';
import { Value } from 'typebox/value';

// TypeBox reports a single `required` error on the parent object listing every
// missing property; split it into one error per missing field so each one lands
// on its own path, re-localizing the message for that single property.
function expandRequiredErrors(
  errors: TLocalizedValidationError[],
): TLocalizedValidationError[] {
  return errors.flatMap<TLocalizedValidationError>((error) =>
    error.keyword === 'required'
      ? error.params.requiredProperties.map((property) => {
          const single = {
            ...error,
            instancePath: `${error.instancePath}/${property.replace(/~/g, '~0').replace(/\//g, '~1')}`,
            params: { requiredProperties: [property] },
          };
          return { ...single, message: Locale.Get()(single) };
        })
      : [error],
  );
}

function parseErrorSchema(
  _errors: TLocalizedValidationError[],
  validateAllFieldCriteria: boolean,
) {
  // See the matching comment in the zod resolver's `parseZod3Issues`.
  const errors: Record<string, FieldError> = Object.create(null);
  for (const error of _errors) {
    const { keyword: type, message, instancePath } = error;
    const _path = instancePath
      .split('/')
      .slice(1)
      .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
      .join('.');

    if (!errors[_path]) {
      errors[_path] = { message, type };
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types && types[type];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        type,
        messages
          ? ([] as string[]).concat(messages as string[], message)
          : message,
      ) as FieldError;
    }
  }

  return errors;
}

/**
 * Creates a resolver for react-hook-form using Typebox schema validation
 * @param {Schema | Validator<TypeContext, Schema>} schema - The Typebox schema to validate against
 * @param {Object} options - Additional resolver configuration
 * @param {string} [options.mode='async'] - Validation mode
 * @returns {Resolver<Static<Schema, TypeContext>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = Type.Object({
 *   name: Type.String(),
 *   age: Type.Number()
 * });
 *
 * useForm({
 *   resolver: typeboxResolver(schema)
 * });
 *
 * // Custom string formats must be registered with TypeBox's own `Format` registry
 * // before validating, since this resolver validates via `typebox`'s `Value.Errors`:
 * // Format.Set('slug', (value) => /^[a-z0-9-]+$/.test(value));
 */
export function typeboxResolver<
  Schema extends TObject,
  Context,
  TypeContext extends TProperties = Record<never, never>,
>(
  schema: Schema | Validator<TypeContext, Schema>,
): Resolver<
  Static<Schema, TypeContext>,
  Context,
  StaticDecode<Schema, TypeContext>
> {
  return async (values: Static<Schema, TypeContext>, _, options) => {
    const errors = expandRequiredErrors(
      schema instanceof Validator
        ? (schema as Validator<TypeContext, Schema>).Errors(values)
        : Value.Errors(schema, values),
    );

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    if (!errors.length) {
      return {
        errors: {},
        values: values as StaticDecode<Schema, TypeContext>,
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
