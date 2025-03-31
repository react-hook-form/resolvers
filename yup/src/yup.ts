import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import {
  FieldError,
  FieldValues,
  Resolver,
  appendErrors,
} from 'react-hook-form';
import * as Yup from 'yup';

/**
 * Why `path!` ? because it could be `undefined` in some case
 * https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
 */
function parseErrorSchema(
  error: Yup.ValidationError,
  validateAllFieldCriteria: boolean,
) {
  return (error.inner || []).reduce<Record<string, FieldError>>(
    (previous, error) => {
      if (!previous[error.path!]) {
        previous[error.path!] = { message: error.message, type: error.type! };
      }

      if (validateAllFieldCriteria) {
        const types = previous[error.path!].types;
        const messages = types && types[error.type!];

        previous[error.path!] = appendErrors(
          error.path!,
          validateAllFieldCriteria,
          previous,
          error.type!,
          messages
            ? ([] as string[]).concat(messages as string[], error.message)
            : error.message,
        ) as FieldError;
      }

      return previous;
    },
    {},
  );
}

export function yupResolver<Input extends FieldValues, Context, Output>(
  schema:
    | Yup.ObjectSchema<Input, any, Output, any>
    | ReturnType<typeof Yup.lazy<Yup.ObjectSchema<Input, any, Output, any>>>,
  schemaOptions?: Parameters<(typeof schema)['validate']>[1],
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Yup.InferType<typeof schema>>;

export function yupResolver<Input extends FieldValues, Context, Output>(
  schema:
    | Yup.ObjectSchema<Input, any, Output, any>
    | ReturnType<typeof Yup.lazy<Yup.ObjectSchema<Input, any, Output, any>>>,
  schemaOptions: Parameters<(typeof schema)['validate']>[1] | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

/**
 * Creates a resolver for react-hook-form using Yup schema validation
 * @param {Yup.ObjectSchema<TFieldValues> | ReturnType<typeof Yup.lazy<Yup.ObjectSchema<TFieldValues>>>} schema - Yup validation schema
 * @param {Parameters<(typeof schema)['validate']>[1]} schemaOptions - Options to pass to Yup's validate/validateSync
 * @param {Object} resolverOptions - Additional resolver configuration
 * @param {('async' | 'sync')} [resolverOptions.mode] - Validation mode
 * @param {boolean} [resolverOptions.raw] - If true, returns raw values instead of validated results
 * @returns {Resolver<Yup.InferType<typeof schema> | Input>} A resolver function compatible with react-hook-form
 * @example
 * const schema = Yup.object({
 *   name: Yup.string().required(),
 *   age: Yup.number().required(),
 * });
 *
 * useForm({
 *   resolver: yupResolver(schema)
 * });
 */
export function yupResolver<Input extends FieldValues, Context, Output>(
  schema:
    | Yup.ObjectSchema<Input, any, Output, any>
    | ReturnType<typeof Yup.lazy<Yup.ObjectSchema<Input, any, Output, any>>>,
  schemaOptions?: Parameters<(typeof schema)['validate']>[1],
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw?: boolean;
  } = {},
): Resolver<Input, Context, Yup.InferType<typeof schema> | Input> {
  return async (values: Input, context, options) => {
    try {
      if (schemaOptions?.context && process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(
          "You should not used the yup options context. Please, use the 'useForm' context object instead",
        );
      }

      const result = await schema[
        resolverOptions.mode === 'sync' ? 'validateSync' : 'validate'
      ](
        values,
        Object.assign({ abortEarly: false }, schemaOptions, { context }),
      );

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        values: resolverOptions.raw ? Object.assign({}, values) : result,
        errors: {},
      };
    } catch (e: any) {
      if (!e.inner) {
        throw e;
      }

      return {
        values: {},
        errors: toNestErrors(
          parseErrorSchema(
            e,
            !options.shouldUseNativeValidation &&
              options.criteriaMode === 'all',
          ),
          options,
        ),
      };
    }
  };
}
