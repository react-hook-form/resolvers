import {
  toNestErrors,
  validateFieldsNatively,
  isObject,
} from '@hookform/resolvers';
import Ajv, { DefinedError, ErrorObject } from 'ajv';
import ajvErrors from 'ajv-errors';
import { appendErrors, FieldError } from 'react-hook-form';
import { Resolver } from './types';

// const parseErrorSchema = (
//   ajvErrors: DefinedError[],
//   validateAllFieldCriteria: boolean,
// ) => {
//   // Ajv will return empty instancePath when require error
//   ajvErrors.forEach((error) => {
//     if (error.keyword === 'required') {
//       error.instancePath += '/' + error.params.missingProperty;
//     }
//   });

//   return ajvErrors.reduce<Record<string, FieldError>>((previous, error) => {
//     // `/deepObject/data` -> `deepObject.data`
//     const path = error.instancePath.substring(1).replace(/\//g, '.');

//     if (!previous[path]) {
//       previous[path] = {
//         message: error.message,
//         type: error.keyword,
//       };
//     }

//     if (validateAllFieldCriteria) {
//       const types = previous[path].types;
//       const messages = types && types[error.keyword];

//       previous[path] = appendErrors(
//         path,
//         validateAllFieldCriteria,
//         previous,
//         error.keyword,
//         messages
//           ? ([] as string[]).concat(messages as string[], error.message || '')
//           : error.message,
//       ) as FieldError;
//     }

//     return previous;
//   }, {});
// };

const customParseErrorSchema = (
  ajvErrors: ErrorObject[],
  validateAllFieldCriteria: boolean,
) => {
  ajvErrors?.forEach((error) => {
    if (error.keyword === 'required') {
      error.instancePath += '/' + error.params.missingProperty;
    }

    if (error.keyword === 'errorMessage') {
      const typedParams = error.params as unknown;
      let isRequiredErrorInParams: Record<string, unknown> | false = false;

      if (
        isObject<Record<string, unknown>>(typedParams) &&
        typedParams.errors
      ) {
        const typedErrors = typedParams.errors as unknown;

        if (Array.isArray(typedErrors)) {
          isRequiredErrorInParams = typedErrors.find((error: unknown) => {
            if (isObject<Record<string, unknown>>(error)) {
              const typedErrorParams = error.params;

              if (
                isObject<Record<string, unknown>>(typedErrorParams) &&
                typedErrorParams.missingProperty &&
                error.keyword === 'required'
              ) {
                return true;
              }

              return false;
            }

            return false;
          });
        }
      }

      if (
        isRequiredErrorInParams &&
        isObject<Record<string, unknown>>(isRequiredErrorInParams) &&
        isRequiredErrorInParams.params &&
        isObject<Record<string, unknown>>(isRequiredErrorInParams.params) &&
        isRequiredErrorInParams.params.missingProperty
      ) {
        error.instancePath +=
          '/' + isRequiredErrorInParams.params.missingProperty;
      }
    }
  });

  return ajvErrors.reduce<Record<string, FieldError>>((previous, error) => {
    // `/deepObject/data` -> `deepObject.data`
    const path = error.instancePath.substring(1).replace(/\//g, '.');

    if (!previous[path]) {
      previous[path] = {
        message: error.message,
        type: error.keyword,
      };
    }

    if (validateAllFieldCriteria) {
      const types = previous[path].types;
      const messages = types && types[error.keyword];

      previous[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        previous,
        error.keyword,
        messages
          ? ([] as string[]).concat(messages as string[], error.message || '')
          : error.message,
      ) as FieldError;
    }

    return previous;
  }, {});
};

export const ajvResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    const ajv = new Ajv(
      Object.assign(
        {},
        {
          allErrors: true,
          validateSchema: true,
        },
        schemaOptions,
      ),
    );

    ajvErrors(ajv);

    const validate = ajv.compile(
      Object.assign(
        { $async: resolverOptions && resolverOptions.mode === 'async' },
        schema,
      ),
    );

    const valid = validate(values);

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return valid
      ? { values, errors: {} }
      : {
          values: {},
          errors: toNestErrors(
            customParseErrorSchema(
              validate.errors as DefinedError[],
              !options.shouldUseNativeValidation &&
                options.criteriaMode === 'all',
            ),
            options,
          ),
        };

    // return valid
    //   ? { values, errors: {} }
    //   : {
    //       values: {},
    //       errors: toNestErrors(
    //         parseErrorSchema(
    //           validate.errors as DefinedError[],
    //           !options.shouldUseNativeValidation &&
    //             options.criteriaMode === 'all',
    //         ),
    //         options,
    //       ),
    //     };
  };
