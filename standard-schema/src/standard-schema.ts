import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { StandardSchemaV1 } from '@standard-schema/spec';
import { FieldError } from 'react-hook-form';
import type { Resolver } from './types';

const parseIssues = (issues: readonly StandardSchemaV1.Issue[]) => {
  const errors: Record<string, FieldError> = {};

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const path = issue.path?.join('.') ?? '';

    if (path) {
      if (!errors[path]) {
        errors[path] = { message: issue.message } as FieldError;
      }
    }
  }

  return errors;
};

export const standardSchemaResolver: Resolver =
  (schema) => async (values, _, options) => {
    let result = schema['~standard'].validate(values);
    if (result instanceof Promise) {
      result = await result;
    }

    if (result.issues) {
      const errors = parseIssues(result.issues);

      return {
        values: {},
        errors: toNestErrors(errors, options),
      };
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      values: values,
      errors: {},
    };
  };
