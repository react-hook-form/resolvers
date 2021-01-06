import { transformToNestObject } from 'react-hook-form';
import * as Vest from 'vest';
import type { Promisify, VestErrors, Resolver } from './types';

const promisify: Promisify = (validatorFn) => (...args) =>
  new Promise((resolve) => validatorFn(...args).done(resolve as Vest.DoneCB));

const parseErrorSchema = (
  vestError: VestErrors,
  validateAllFieldCriteria: boolean,
) => {
  return Object.entries(vestError).reduce((prev, [key, value]) => {
    return {
      ...prev,
      [key]: {
        type: '',
        message: value[0],
        ...(validateAllFieldCriteria
          ? {
              types: value.reduce((prev, message, index) => {
                return {
                  ...prev,
                  [index]: message,
                };
              }, {}),
            }
          : {}),
      },
    };
  }, {});
};

export const vestResolver: Resolver = (schema, _ = {}) => async (
  values,
  _context,
  validateAllFieldCriteria = false,
) => {
  const validateSchema = promisify(schema);
  const result = await validateSchema(values);
  const errors = result.getErrors();

  if (!result.hasErrors()) {
    return { values: values as any, errors: {} };
  }

  return {
    values: {},
    errors: transformToNestObject(
      parseErrorSchema(errors, validateAllFieldCriteria),
    ),
  };
};
