import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { SimpleErrorReporter, VineValidator, errors } from '@vinejs/vine';
import {
  ConstructableSchema,
  ValidationOptions,
} from '@vinejs/vine/build/src/types';
import {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';

function parseErrorSchema(
  vineErrors: SimpleErrorReporter['errors'],
  validateAllFieldCriteria: boolean,
) {
  const schemaErrors: Record<string, FieldError> = {};

  for (; vineErrors.length; ) {
    const error = vineErrors[0];
    const path = error.field;

    if (!(path in schemaErrors)) {
      schemaErrors[path] = { message: error.message, type: error.rule };
    }

    if (validateAllFieldCriteria) {
      const { types } = schemaErrors[path];
      const messages = types && types[error.rule];

      schemaErrors[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        schemaErrors,
        error.rule,
        messages ? [...(messages as string[]), error.message] : error.message,
      ) as FieldError;
    }

    vineErrors.shift();
  }

  return schemaErrors;
}

export function vineResolver<Input extends FieldValues, Context, Output>(
  schema: VineValidator<ConstructableSchema<Input, Output, Output>, any>,
  schemaOptions?: ValidationOptions<any>,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function vineResolver<Input extends FieldValues, Context, Output>(
  schema: VineValidator<ConstructableSchema<Input, Output, Output>, any>,
  schemaOptions: ValidationOptions<any> | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form using VineJS schema validation
 * @param {T} schema - The VineJS schema to validate against
 * @param {ValidationOptions<any>} [schemaOptions] - Optional VineJS validation options
 * @param {Object} [resolverOptions] - Optional resolver configuration
 * @param {boolean} [resolverOptions.raw=false] - If true, returns raw values instead of validated results
 * @returns {Resolver<Infer<typeof schema>>} A resolver function compatible with react-hook-form
 * @example
 * const schema = vine.compile(
 *   vine.object({
 *     name: vine.string().minLength(2),
 *     age: vine.number().min(18)
 *   })
 * );
 *
 * useForm({
 *   resolver: vineResolver(schema)
 * });
 */
export function vineResolver<Input extends FieldValues, Context, Output>(
  schema: VineValidator<ConstructableSchema<Input, Output, Output>, any>,
  schemaOptions?: ValidationOptions<any>,
  resolverOptions: { raw?: boolean } = {},
): Resolver<Input, Context, Output | Input> {
  return async (values, _, options) => {
    try {
      const data = await schema.validate(values, schemaOptions);

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        errors: {} as FieldErrors,
        values: resolverOptions.raw ? Object.assign({}, values) : data,
      };
    } catch (error: any) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              error.messages,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };
      }

      throw error;
    }
  };
}
