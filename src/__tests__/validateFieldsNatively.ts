import { Field, FieldError, InternalFieldName } from 'react-hook-form';
import { validateFieldsNatively } from '../validateFieldsNatively';

const flatObject: Record<string, FieldError> = {
  name: { type: 'st', message: 'first message' },
};

const getfields = (mockReportValidity: any, mockSetCustomValidity: any) =>
  ({
    name: {
      ref: {
        reportValidity: vi.fn(),
        setCustomValidity: vi.fn(),
      },
    },
    nd: {
      ref: {
        reportValidity: vi.fn(),
        setCustomValidity: vi.fn(),
      },
    },
    array: {
      refs: [
        {
          reportValidity: mockReportValidity,
          setCustomValidity: mockSetCustomValidity,
        },
        {
          reportValidity: mockReportValidity,
          setCustomValidity: mockSetCustomValidity,
        },
      ],
    },
  }) as any as Record<InternalFieldName, Field['_f']>;

test('validates natively fields', () => {
  const mockReportValidity = vi.fn();
  const mockSetCustomValidity = vi.fn();
  const fields = getfields(mockReportValidity, mockSetCustomValidity);

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

  expect(mockReportValidity).toHaveBeenCalledTimes(2);
  expect(mockSetCustomValidity).toHaveBeenCalledTimes(2);
});
