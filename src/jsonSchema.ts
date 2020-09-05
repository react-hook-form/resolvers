import { appendErrors, Resolver, transformToNestObject } from 'react-hook-form';
import * as Ajv from 'ajv';
import { ErrorObject, Options } from 'ajv';
import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import {
  FieldError,
  FieldErrors,
  ResolverError,
  ResolverSuccess,
} from 'react-hook-form/dist/types/form';

export type JSONSchema = (JSONSchema4 | JSONSchema6 | JSONSchema7) & {
  $async?: boolean;
};

const parseErrorSchema = <TFieldValues extends Record<string, any>>(
  validationError: Array<ErrorObject> | null | undefined,
  validateAllFieldCriteria: boolean,
): FieldErrors<TFieldValues> =>
  Array.isArray(validationError)
    ? validationError.reduce(
        (
          previous: FieldErrors<TFieldValues>,
          { dataPath, keyword, message },
        ) => {
          const path = dataPath.replace(/\//g, '.').replace(/^\./, '');
          return {
            ...previous,
            ...(path
              ? previous[path] && validateAllFieldCriteria
                ? {
                    [path]: appendErrors(
                      path,
                      validateAllFieldCriteria,
                      previous as Record<string, any>,
                      keyword,
                      message,
                    ),
                  }
                : {
                    [path]:
                      previous[path] ||
                      ({
                        type: keyword,
                        message,
                        ...(validateAllFieldCriteria
                          ? {
                              types: { [keyword]: message || true },
                            }
                          : {}),
                      } as FieldError),
                  }
              : {}),
          };
        },
        {},
      )
    : {};

export interface JsonSchemaOptions {
  ajvOptions?: Omit<Options, 'allErrors' | 'validateSchema' | 'transpile'>;
}

export const jsonSchemaResolver = <TFieldValues extends Record<string, any>>(
  validationSchema: JSONSchema,
  options: JsonSchemaOptions = {},
): Resolver<TFieldValues> => {
  if (!validationSchema || typeof validationSchema !== 'object') {
    throw new Error('Invalid AJV schema or validation function');
  }

  const async =
    options.ajvOptions?.async === true ||
    [true, 'true'].includes((validationSchema as any).$async);
  const ajv = new Ajv({
    ...options.ajvOptions,
    async,
    allErrors: true,
    validateSchema: true,
    transpile: undefined,
  });
  const validate = ajv.compile(validationSchema);

  return async (data, _, validateAllFieldCriteria = false) => {
    let valid: boolean;
    let errors: Ajv.ErrorObject[] | null | undefined = null;
    if (async) {
      try {
        const tmp = await validate(data);
        valid = tmp === data;
      } catch (e) {
        valid = false;
        errors = e.errors;
      }
    } else {
      valid = validate(data) as boolean;
      errors = validate.errors;
    }

    return valid
      ? ({
          values: data,
          errors: {},
        } as ResolverSuccess<TFieldValues>)
      : ({
          values: {},
          errors: transformToNestObject(
            parseErrorSchema<TFieldValues>(errors, validateAllFieldCriteria),
          ),
        } as ResolverError<TFieldValues>);
  };
};
