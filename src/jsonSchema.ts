import { appendErrors, Resolver, transformToNestObject } from 'react-hook-form';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import {
  FieldError,
  FieldErrors,
  ResolverError,
  ResolverSuccess,
} from 'react-hook-form/dist/types/form';

type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

const parseErrorSchema = <TFieldValues extends Record<string, any>>(
  validationError: Array<ErrorObject> | null | undefined,
  validateAllFieldCriteria: boolean,
): FieldErrors<TFieldValues> =>
  Array.isArray(validationError)
    ? validationError.reduce(
        (
          previous: FieldErrors<TFieldValues>,
          { dataPath, keyword, message = '', propertyName = '' },
        ) => {
          const path =
            dataPath.replace(/\//g, '.').replace(/^\./, '') || propertyName;
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

export const jsonSchemaResolver = <TFieldValues extends Record<string, any>>(
  validationSchema: JSONSchema,
): Resolver<TFieldValues> => {
  const validate: ValidateFunction | undefined =
    validationSchema && typeof validationSchema === 'object'
      ? (() => {
          const ajv = new Ajv({ allErrors: true });
          return ajv.compile(validationSchema);
        })()
      : undefined;

  if (!validate) {
    throw new Error('Invalid AJV schema or validation function');
  }

  return async (data, _, validateAllFieldCriteria = false) => {
    const valid = validate(data) as boolean;
    const errors = validate.errors;

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
