import { toNestError } from '@hookform/resolvers';
import promisify from 'vest/promisify';
import { DraftResult, IVestResult } from 'vest/vestResult';
import type { VestErrors, Resolver } from './types';

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

export const vestResolver: Resolver = (
  schema,
  _,
  { mode } = { mode: 'async' },
) => async (values, _context, { criteriaMode, fields }) => {
  let result: IVestResult | DraftResult;
  if (mode === 'async') {
    const validateSchema = promisify(schema);
    result = await validateSchema(values);
  } else {
    result = schema(values);
  }

  const errors = result.getErrors();

  if (!result.hasErrors()) {
    return { values, errors: {} };
  }

  return {
    values: {},
    errors: toNestError(
      parseErrorSchema(errors, criteriaMode === 'all'),
      fields,
    ),
  };
};
