import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import type { VObject } from 'convex/values';
import {
  FieldError,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';

type ConvexIssue = {
  path?: (string | number)[];
  message: string;
  code?: string;
};

type ConvexValidationResult<T> =
  | { success: true; value: T }
  | { success: false; issues: ConvexIssue[] };

type ConvexSchema<Input, Output> = {
  validate: (
    value: Input,
  ) => ConvexValidationResult<Output> | Promise<ConvexValidationResult<Output>>;
};

function parseIssues(issues: ConvexIssue[], validateAllFieldCriteria: boolean) {
  const errors: Record<string, FieldError> = {};

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const path = (issue.path || []).join('.');
    const type = issue.code || '';

    if (path) {
      if (!errors[path]) {
        errors[path] = { message: issue.message, type };
      }

      if (validateAllFieldCriteria) {
        const types = errors[path].types;
        const messages = types && types[type];
        errors[path] = appendErrors(
          path,
          validateAllFieldCriteria,
          errors,
          type,
          messages
            ? ([] as string[]).concat(
                messages as string | string[],
                issue.message,
              )
            : issue.message,
        ) as FieldError;
      }
    }
  }

  return errors;
}

export function convexResolver<Input extends FieldValues, Context, Output>(
  schema: ConvexSchema<Input, Output> | VObject<any, any, any, any>,
  _schemaOptions?: never,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;

export function convexResolver<Input extends FieldValues, Context, Output>(
  schema: ConvexSchema<Input, Output> | VObject<any, any, any, any>,
  _schemaOptions: never | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

export function convexResolver<Input extends FieldValues, Context, Output>(
  schema: ConvexSchema<Input, Output> | VObject<any, any, any, any>,
  _schemaOptions?: never,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Output | Input> {
  return async (values, _context, options) => {
    const validateAllFieldCriteria =
      !options.shouldUseNativeValidation && options.criteriaMode === 'all';

    let result: ConvexValidationResult<Output>;
    const candidate: any = schema as any;

    if (typeof candidate?.validate === 'function') {
      result = await candidate.validate(values);
    } else {
      result = validateWithConvexValidator(
        candidate,
        values,
      ) as ConvexValidationResult<Output>;
    }

    if (!result.success) {
      const errors = parseIssues(result.issues || [], validateAllFieldCriteria);
      return {
        values: {},
        errors: toNestErrors(errors, options),
      } as const;
    }

    options.shouldUseNativeValidation && validateFieldsNatively({}, options);

    return {
      values: resolverOptions.raw
        ? Object.assign({}, values)
        : (result.value as any),
      errors: {},
    } as const;
  };
}

function validateWithConvexValidator(
  validator: any,
  value: any,
): ConvexValidationResult<any> {
  const issues: ConvexIssue[] = [];

  function walk(v: any, data: any, path: (string | number)[]) {
    const kind = v?.kind;
    switch (kind) {
      case 'string':
        if (typeof data !== 'string') {
          issues.push({ path, message: 'Expected string', code: 'type' });
        }
        return;
      case 'number':
      case 'float64':
        if (typeof data !== 'number' || Number.isNaN(data)) {
          issues.push({ path, message: 'Expected number', code: 'type' });
        }
        return;
      case 'int64':
        if (typeof data !== 'bigint') {
          issues.push({ path, message: 'Expected bigint', code: 'type' });
        }
        return;
      case 'boolean':
        if (typeof data !== 'boolean') {
          issues.push({ path, message: 'Expected boolean', code: 'type' });
        }
        return;
      case 'null':
        if (data !== null) {
          issues.push({ path, message: 'Expected null', code: 'type' });
        }
        return;
      case 'bytes':
        if (!(data instanceof ArrayBuffer)) {
          issues.push({ path, message: 'Expected ArrayBuffer', code: 'type' });
        }
        return;
      case 'literal':
        if (data !== v.value) {
          issues.push({ path, message: 'Expected literal', code: 'literal' });
        }
        return;
      case 'id':
        if (typeof data !== 'string') {
          issues.push({ path, message: 'Expected id', code: 'type' });
        }
        return;
      case 'array':
        if (!Array.isArray(data)) {
          issues.push({ path, message: 'Expected array', code: 'type' });
          return;
        }
        for (let i = 0; i < data.length; i++) {
          walk(v.element, data[i], path.concat(i));
        }
        return;
      case 'object': {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          issues.push({ path, message: 'Expected object', code: 'type' });
          return;
        }
        const fields = v.fields || {};
        for (const key of Object.keys(fields)) {
          const child = fields[key];
          const isOptional = child?.isOptional === 'optional';
          const childValue = (data as any)[key];
          if (childValue === undefined) {
            if (!isOptional) {
              issues.push({
                path: path.concat(key),
                message: 'Field is required',
                code: 'required',
              });
            }
            continue;
          }
          walk(child, childValue, path.concat(key));
        }
        return;
      }
      case 'record': {
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          issues.push({ path, message: 'Expected record', code: 'type' });
          return;
        }
        const valueValidator = v.value;
        for (const key of Object.keys(data)) {
          walk(valueValidator, (data as any)[key], path.concat(key));
        }
        return;
      }
      case 'union': {
        const members = v.members ?? [];
        let matched = false;
        for (const m of members) {
          const before = issues.length;
          walk(m, data, path);
          const after = issues.length;

          if (after === before) {
            matched = true;
            issues.length = before;
            break;
          } else {
            issues.length = before;
          }
        }
        if (!matched) {
          issues.push({
            path,
            message: 'No union member matched',
            code: 'union',
          });
        }
        return;
      }
      case 'any':
      default:
        return;
    }
  }

  walk(validator, value, []);

  if (issues.length) {
    return { success: false, issues };
  }
  return { success: true, value };
}
