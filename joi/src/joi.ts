import { appendErrors, transformToNestObject } from 'react-hook-form';
import * as Joi from 'joi';
// @ts-expect-error maybe fixed after the first publish ?
import { convertArrayToPathName } from '@hookform/resolvers';
import { Resolver } from './types';

const parseErrorSchema = (
  error: Joi.ValidationError,
  validateAllFieldCriteria: boolean,
) =>
  Array.isArray(error.details)
    ? error.details.reduce(
        (previous: Record<string, any>, { path, message = '', type }) => {
          const currentPath = convertArrayToPathName(path);

          return {
            ...previous,
            ...(path
              ? previous[currentPath] && validateAllFieldCriteria
                ? {
                    [currentPath]: appendErrors(
                      currentPath,
                      validateAllFieldCriteria,
                      previous,
                      type,
                      message,
                    ),
                  }
                : {
                    [currentPath]: previous[currentPath] || {
                      message,
                      type,
                      ...(validateAllFieldCriteria
                        ? {
                            types: { [type]: message || true },
                          }
                        : {}),
                    },
                  }
              : {}),
          };
        },
        {},
      )
    : [];

export const joiResolver: Resolver = (
  schema,
  schemaOptions = {
    abortEarly: false,
  },
  { mode } = { mode: 'async' },
) => async (values, context, { criteriaMode }) => {
  try {
    let result;
    if (mode === 'async') {
      result = await schema.validateAsync(values, {
        ...schemaOptions,
        context,
      });
    } else {
      const { value, error } = schema.validate(values, {
        ...schemaOptions,
        context,
      });

      if (error) {
        throw error;
      }

      result = value;
    }

    return {
      values: result,
      errors: {},
    };
  } catch (e) {
    return {
      values: {},
      errors: transformToNestObject(
        parseErrorSchema(e, criteriaMode === 'all'),
      ),
    };
  }
};
