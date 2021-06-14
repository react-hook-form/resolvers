/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Field, FieldError, InternalFieldName } from 'react-hook-form';
import { toNestError } from '../toNestError';

const flatObject: Record<string, FieldError> = {
  name: { type: 'st', message: 'first message' },
  'test.0.name': { type: 'nd', message: 'second message' },
  'n.test': { type: 'rd', message: 'third message' },
};

const fields = {
  name: {
    ref: {
      reportValidity: jest.fn(),
      setCustomValidity: jest.fn(),
    },
  },
  n: {
    test: {
      ref: {
        reportValidity: jest.fn(),
        setCustomValidity: jest.fn(),
      },
    },
  },
  unused: {
    ref: { name: 'unusedRef' },
  },
} as any as Record<InternalFieldName, Field['_f']>;

test('transforms flat object to nested object', () => {
  expect(
    toNestError(flatObject, { fields, shouldUseNativeValidation: false }),
  ).toMatchSnapshot();
});

test('transforms flat object to nested object and shouldUseNativeValidation: true', () => {
  expect(
    toNestError(flatObject, { fields, shouldUseNativeValidation: true }),
  ).toMatchSnapshot();
  expect(
    (fields.name.ref as HTMLInputElement).reportValidity,
  ).toHaveBeenCalledTimes(1);
  expect(
    (fields.name.ref as HTMLInputElement).setCustomValidity,
  ).toHaveBeenCalledTimes(1);
  expect(
    (fields.name.ref as HTMLInputElement).setCustomValidity,
  ).toHaveBeenCalledWith(flatObject.name.message);

  // @ts-expect-error
  expect(fields.n?.test.ref.reportValidity).toHaveBeenCalledTimes(1);
  // @ts-expect-error
  expect(fields.n.test.ref.setCustomValidity).toHaveBeenCalledTimes(1);
  // @ts-expect-error
  expect(fields.n.test.ref.setCustomValidity).toHaveBeenCalledWith(
    flatObject['n.test'].message,
  );
});
