import { Field, FieldError, InternalFieldName } from 'react-hook-form';
import { toNestErrors } from '../toNestErrors';

const flatObject: Record<string, FieldError> = {
  name: { type: 'st', message: 'first message' },
  'name.firstName': { type: 'rd', message: 'third message' },
  'test.0.name': { type: 'nd', message: 'second message' },
};

const fields = {
  name: {
    ref: {
      reportValidity: vi.fn(),
      setCustomValidity: vi.fn(),
    },
  },
  unused: {
    ref: { name: 'unusedRef' },
  },
} as any as Record<InternalFieldName, Field['_f']>;

test('transforms flat object to nested object', () => {
  expect(
    toNestErrors(flatObject, { fields, shouldUseNativeValidation: false }),
  ).toMatchSnapshot();
});

test('transforms flat object to nested object and shouldUseNativeValidation: true', () => {
  expect(
    toNestErrors(flatObject, { fields, shouldUseNativeValidation: true }),
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
});

test('transforms flat object to nested object with names option', () => {
  const result = toNestErrors(
    {
      username: {
        type: 'custom',
        message: 'error',
      },
    },
    {
      names: ['username', 'username.first'],
      fields: {
        username: {
          name: 'username',
          ref: { name: 'username' },
        },
      },
      shouldUseNativeValidation: false,
    },
  );

  expect(result).toEqual({
    username: {
      type: 'custom',
      message: 'error',
      ref: { name: 'username' },
    },
  });
});

test('transforms flat object to nested object with root error for field array', () => {
  const result = toNestErrors(
    {
      username: { type: 'username', message: 'username is required' },
      'fieldArrayWithRootError.0.name': {
        type: 'first',
        message: 'first message',
      },
      'fieldArrayWithRootError.0.nestFieldArrayWithoutRootError.0.title': {
        type: 'title',
        message: 'title',
      },
      'fieldArrayWithRootError.0.nestFieldArrayWithRootError': {
        type: 'nested-root-title',
        message: 'nested root errors',
      },
      'fieldArrayWithRootError.0.nestFieldArrayWithRootError.0.title': {
        type: 'nestFieldArrayWithRootError-title',
        message: 'nestFieldArrayWithRootError-title',
      },
      'fieldArrayWithRootError.1.name': {
        type: 'second',
        message: 'second message',
      },
      fieldArrayWithRootError: { type: 'root-error', message: 'root message' },
      'fieldArrayWithoutRootError.0.name': {
        type: 'first',
        message: 'first message',
      },
      'fieldArrayWithoutRootError.1.name': {
        type: 'second',
        message: 'second message',
      },
    },
    {
      fields: {
        username: { name: 'username', ref: { name: 'username' } },
        fieldArrayWithRootError: {
          name: 'fieldArrayWithRootError',
          ref: { name: 'fieldArrayWithRootError' },
        },
        'fieldArrayWithRootError.0.name': {
          name: 'fieldArrayWithRootError.0.name',
          ref: { name: 'fieldArrayWithRootError.0.name' },
        },
        'fieldArrayWithRootError.0.nestFieldArrayWithoutRootError.0.title': {
          name: 'fieldArrayWithRootError.0.nestFieldArrayWithoutRootError.0.title',
          ref: {
            name: 'fieldArrayWithRootError.0.nestFieldArrayWithoutRootError.0.title',
          },
        },
        'fieldArrayWithRootError.0.nestFieldArrayWithRootError': {
          name: 'fieldArrayWithRootError.0.nestFieldArrayWithRootError',
          ref: {
            name: 'fieldArrayWithRootError.0.nestFieldArrayWithRootError',
          },
        },
        'fieldArrayWithRootError.0.nestFieldArrayWithRootError.0.title': {
          name: 'fieldArrayWithRootError.0.nestFieldArrayWithRootError.0.title',
          ref: {
            name: 'fieldArrayWithRootError.0.nestFieldArrayWithRootError.0.title',
          },
        },
        'fieldArrayWithRootError.1.name': {
          name: 'fieldArrayWithRootError.1.name',
          ref: { name: 'fieldArrayWithRootError.1.name' },
        },
        'fieldArrayWithoutRootError.0.name': {
          name: 'fieldArrayWithoutRootError.0.name',
          ref: { name: 'fieldArrayWithoutRootError.0.name' },
        },
        'fieldArrayWithoutRootError.1.name': {
          name: 'fieldArrayWithoutRootError.1.name',
          ref: { name: 'fieldArrayWithoutRootError.1.name' },
        },
      },
      names: [
        'username',
        'fieldArrayWithRootError',
        'fieldArrayWithRootError.0.name',
        'fieldArrayWithRootError.0.nestFieldArrayWithoutRootError.0.title',
        'fieldArrayWithRootError.1.name',
        'fieldArrayWithoutRootError.0.name',
        'fieldArrayWithoutRootError.1.name',
        'fieldArrayWithRootError.0.nestFieldArrayWithRootError',
        'fieldArrayWithRootError.0.nestFieldArrayWithRootError.0.title',
      ],
      shouldUseNativeValidation: false,
    },
  );

  expect(result).toEqual({
    username: {
      type: 'username',
      message: 'username is required',
      ref: { name: 'username' },
    },
    fieldArrayWithRootError: {
      '0': {
        name: {
          type: 'first',
          message: 'first message',
          ref: { name: 'fieldArrayWithRootError.0.name' },
        },
        nestFieldArrayWithoutRootError: [
          {
            title: {
              type: 'title',
              message: 'title',
              ref: {
                name: 'fieldArrayWithRootError.0.nestFieldArrayWithoutRootError.0.title',
              },
            },
          },
        ],
        nestFieldArrayWithRootError: {
          '0': {
            title: {
              type: 'nestFieldArrayWithRootError-title',
              message: 'nestFieldArrayWithRootError-title',
              ref: {
                name: 'fieldArrayWithRootError.0.nestFieldArrayWithRootError.0.title',
              },
            },
          },
          root: {
            type: 'nested-root-title',
            message: 'nested root errors',
            ref: {
              name: 'fieldArrayWithRootError.0.nestFieldArrayWithRootError',
            },
          },
        },
      },
      '1': {
        name: {
          type: 'second',
          message: 'second message',
          ref: { name: 'fieldArrayWithRootError.1.name' },
        },
      },
      root: {
        type: 'root-error',
        message: 'root message',
        ref: { name: 'fieldArrayWithRootError' },
      },
    },
    fieldArrayWithoutRootError: [
      {
        name: {
          type: 'first',
          message: 'first message',
          ref: { name: 'fieldArrayWithoutRootError.0.name' },
        },
      },
      {
        name: {
          type: 'second',
          message: 'second message',
          ref: { name: 'fieldArrayWithoutRootError.1.name' },
        },
      },
    ],
  });
});

test('ensures consistent ordering when a field array has a root error and an error in the non-first element', () => {
  const result = toNestErrors(
    {
      'fieldArrayWithRootError.1.name': {
        type: 'second',
        message: 'second message',
      },
      fieldArrayWithRootError: { type: 'root-error', message: 'root message' },
    },
    {
      fields: {
        fieldArrayWithRootError: {
          name: 'fieldArrayWithRootError',
          ref: { name: 'fieldArrayWithRootError' },
        },
        'fieldArrayWithRootError.0.name': {
          name: 'fieldArrayWithRootError.0.name',
          ref: { name: 'fieldArrayWithRootError.0.name' },
        },
        'fieldArrayWithRootError.1.name': {
          name: 'fieldArrayWithRootError.1.name',
          ref: { name: 'fieldArrayWithRootError.1.name' },
        },
      },
      names: [
        'fieldArrayWithRootError',
        'fieldArrayWithRootError.0.name',
        'fieldArrayWithRootError.1.name',
      ],
      shouldUseNativeValidation: false,
    },
  );

  expect(result).toEqual({
    fieldArrayWithRootError: {
      '1': {
        name: {
          type: 'second',
          message: 'second message',
          ref: { name: 'fieldArrayWithRootError.1.name' },
        },
      },
      root: {
        type: 'root-error',
        message: 'root message',
        ref: { name: 'fieldArrayWithRootError' },
      },
    },
  });
});

test('should correctly validate object with special characters', () => {
  const result = toNestErrors(
    { '[array-2]': { type: 'string', message: 'string is required' } },
    {
      names: ['[array-2]'],
      fields: {
        '[array-2]': { name: '[array-2]', ref: { name: '[array-2]' } },
      },
      shouldUseNativeValidation: false,
    },
  );

  expect(result).toEqual({
    'array-2': {
      type: 'string',
      message: 'string is required',
      ref: { name: '[array-2]' },
    },
  });
});
