import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { ValidationError, Validator } from 'ata-validator';
import {
  FieldError,
  FieldValues,
  ResolverOptions,
  ResolverResult,
  appendErrors,
} from 'react-hook-form';
import { CompiledResolver, Resolver } from './types';

const parseErrorSchema = (
  ataErrors: ValidationError[],
  validateAllFieldCriteria: boolean,
) => {
  // See the matching comment in the ajv resolver's `parseErrorSchema`.
  const parsedErrors: Record<string, FieldError> = Object.create(null);

  for (let index = 0; index < ataErrors.length; index += 1) {
    const error = ataErrors[index];

    const instancePath =
      error.keyword === 'required'
        ? `${error.instancePath}/${error.params.missingProperty}`
        : error.instancePath;

    const path = instancePath.substring(1).replace(/\//g, '.');

    if (!parsedErrors[path]) {
      parsedErrors[path] = {
        message: error.message,
        type: error.keyword,
      };
    }

    if (validateAllFieldCriteria) {
      const types = parsedErrors[path].types;
      const messages = types && types[error.keyword];

      parsedErrors[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        parsedErrors,
        error.keyword,
        messages
          ? ([] as string[]).concat(messages as string[], error.message || '')
          : error.message,
      ) as FieldError;
    }
  }

  return parsedErrors;
};

const toResult = <TFieldValues extends FieldValues>(
  result: { valid: boolean; errors: readonly ValidationError[] },
  values: TFieldValues,
  options: ResolverOptions<TFieldValues>,
  raw: boolean | undefined,
): ResolverResult<TFieldValues> => {
  options.shouldUseNativeValidation && validateFieldsNatively({}, options);

  return result.valid
    ? {
        values: raw ? Object.assign({}, values) : values,
        errors: {},
      }
    : {
        values: {},
        errors: toNestErrors(
          parseErrorSchema(
            result.errors as ValidationError[],
            !options.shouldUseNativeValidation &&
              options.criteriaMode === 'all',
          ),
          options,
        ),
      };
};

export const ataResolver: Resolver = (
  schema,
  schemaOptions,
  resolverOptions = {},
) => {
  const validator = new Validator(schema, schemaOptions);
  return async (values, _, options) =>
    toResult(validator.validate(values), values, options, resolverOptions.raw);
};

// For a module written ahead of time by `ata compile --order`, so the
// validator is compiled at build time and ata-validator itself stays out of
// the bundle. The module fills defaults with `applyDefaults` and reports its
// errors in the runtime's order, so the answer is the one `ataResolver` gives.
export const ataCompiledResolver: CompiledResolver = (
  compiled,
  resolverOptions = {},
) => {
  return async (values, _, options) => {
    if (compiled.applyDefaults) {
      compiled.applyDefaults(values);
    }
    return toResult(
      compiled.validate(values),
      values,
      options,
      resolverOptions.raw,
    );
  };
};
