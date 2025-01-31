import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { SimpleErrorReporter, VineValidator, errors } from '@vinejs/vine';
import { Infer, ValidationOptions } from '@vinejs/vine/build/src/types';
import {
  FieldError,
  FieldErrors,
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

export function vineResolver<T extends VineValidator<any, any>>(
  schema: T,
  schemaOptions?: ValidationOptions<any>,
  resolverOptions: { raw?: boolean } = {},
): Resolver<Infer<typeof schema>> {
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
