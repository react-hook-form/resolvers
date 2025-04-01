import * as v from '@badrap/valita';
import { toNestErrors } from '@hookform/resolvers';
import { FieldError, FieldValues, Resolver } from 'react-hook-form';

/**
 * Creates a resolver for react-hook-form using valita
 *
 * @param {v.Type<FieldValues>} schema - The valita schema to validate against
 * @param {Object} [schemaOptions] - Optional valita validation options
 * @param {v.ParseOptions['mode']} [schemaOptions.parsingMode="strict"] - Optional valita parsing mode
 * @param {Object} [resolverOptions] - Optional resolver-specific configuration
 * @param {boolean} [resolverOptions.raw=false] - If true, returns the raw form values instead of the parsed data
 *
 * @returns {Resolver<v.Infer<typeof schema>>} A resolver function compatible with react-hook-form
 *
 * @example
 * const schema = valita.object({
 *   name: valita.string(),
 *   age: valita.number()
 * });
 *
 * useForm({
 *   resolver: valitaResolver(schema)
 * });
 */
export function valitaResolver<Schema extends v.Type<FieldValues>>(
  schema: Schema,
  schemaOptions: {
    /**
     * Parsing mode for valita
     * @default strict
     */
    parsingMode?: v.ParseOptions['mode'];
  } = {
    parsingMode: 'strict',
  },
  resolverOptions: {
    /**
     * Return the raw input values rather than the parsed values.
     * @default false
     */
    raw?: boolean;
  } = {},
): Resolver<v.Infer<typeof schema>> {
  return async (values, _, options) => {
    const result = schema.try(values, {
      mode: schemaOptions.parsingMode,
    });

    if (!result.ok) {
      return {
        values: {},
        errors: toNestErrors(parseIssues(result.issues), options),
      };
    }

    return {
      values: resolverOptions.raw
        ? Object.assign({}, values)
        : (result.value as FieldValues),
      errors: {},
    };
  };
}

type ValitaIssue = v.ValitaError['issues'][number];

function getMessageFromIssue(issue: ValitaIssue): string {
  if (issue.code === 'custom_error' && issue.error !== undefined) {
    if (typeof issue.error === 'string') {
      return issue.error;
    }
    if (issue.error.message !== undefined) {
      return issue.error.message;
    }
  }
  return issue.code;
}

function parseIssues(issues: readonly ValitaIssue[]) {
  const errors: Record<string, FieldError> = {};

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const path = getDotPath(issue);

    if (!path) {
      continue;
    }

    if (!errors[path]) {
      errors[path] = { message: getMessageFromIssue(issue), type: issue.code };
    }
  }

  return errors;
}

/**
 * Creates and returns the dot path of an issue if possible.
 *
 * Adapted from @standard-schema/util getDotPath()
 *
 * @param issue The issue to get the dot path from.
 *
 * @returns The dot path or null.
 */
function getDotPath(issue: ValitaIssue): string | null {
  if (issue.path?.length) {
    let dotPath = '';

    for (const key of issue.path) {
      if (typeof key === 'string' || typeof key === 'number') {
        if (dotPath) {
          dotPath += `.${key}`;
        } else {
          dotPath += key;
        }
      } else {
        return null;
      }
    }
    return dotPath;
  }
  return null;
}
