import { Field, FieldError, InternalFieldName } from 'react-hook-form';
import { validateFieldsNatively } from '../validateFieldsNatively';

const flatObject: Record<string, FieldError> = {
  name: { type: 'st', message: 'first message' },
};

const fields = {
  name: {
    ref: {
      reportValidity: jest.fn(),
      setCustomValidity: jest.fn(),
    },
  },
  nd: {
    ref: {
      reportValidity: jest.fn(),
      setCustomValidity: jest.fn(),
    },
  },
} as any as Record<InternalFieldName, Field['_f']>;

test('validates natively fields', () => {
  validateFieldsNatively(flatObject, {
    fields,
    shouldUseNativeValidation: true,
  });

  expect(
    (fields.name.ref as HTMLInputElement).setCustomValidity,
  ).toHaveBeenCalledWith(flatObject.name.message);
  expect(
    (fields.name.ref as HTMLInputElement).reportValidity,
  ).toHaveBeenCalledTimes(1);

  expect(
    (fields.nd.ref as HTMLInputElement).setCustomValidity,
  ).toHaveBeenCalledWith('');
  expect(
    (fields.nd.ref as HTMLInputElement).reportValidity,
  ).toHaveBeenCalledTimes(1);
});
