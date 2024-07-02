import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { JSONSchemaType } from 'ajv';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '..';

const USERNAME_REQUIRED_MESSAGE = 'username field is required';
const CUSTOM_USERNAME_REQUIRED_MESSAGE = 'Username is required';
const PASSWORD_REQUIRED_MESSAGE = 'password field is required';

type FormData = { username: string; password: string };

const schema: JSONSchemaType<FormData> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: USERNAME_REQUIRED_MESSAGE },
    },
    password: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: PASSWORD_REQUIRED_MESSAGE },
    },
  },
  required: ['username', 'password'],
  additionalProperties: false,
  errorMessage: {
    required: {
      username: CUSTOM_USERNAME_REQUIRED_MESSAGE,
    },
  },
};

interface Props {
  onSubmit: (data: FormData) => void;
  isInitialValueUndefined?: boolean;
}

function TestComponent({ onSubmit, isInitialValueUndefined }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: ajvResolver(schema),
    shouldUseNativeValidation: true,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username', {
          setValueAs: (value) =>
            isInitialValueUndefined ? value || undefined : value,
        })}
        placeholder="username"
      />

      <input
        {...register('password', {
          setValueAs: (value) =>
            isInitialValueUndefined ? value || undefined : value,
        })}
        placeholder="password"
      />

      <button type="submit">submit</button>
    </form>
  );
}

test("form's native validation with Ajv", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  // username
  let usernameField = screen.getByPlaceholderText(
    /username/i,
  ) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  // password
  let passwordField = screen.getByPlaceholderText(
    /password/i,
  ) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');

  await user.click(screen.getByText(/submit/i));

  // username
  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(false);
  expect(usernameField.validationMessage).toBe(USERNAME_REQUIRED_MESSAGE);

  // password
  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(false);
  expect(passwordField.validationMessage).toBe(PASSWORD_REQUIRED_MESSAGE);

  await user.type(screen.getByPlaceholderText(/username/i), 'joe');
  await user.type(screen.getByPlaceholderText(/password/i), 'password');

  // username
  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  // password
  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');
});

test("form's native validation with Ajv for required fields with custom error messages", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} isInitialValueUndefined />);

  // username
  let usernameField = screen.getByPlaceholderText(
    /username/i,
  ) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  // password
  let passwordField = screen.getByPlaceholderText(
    /password/i,
  ) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');

  await user.click(screen.getByText(/submit/i));

  // username
  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(false);
  expect(usernameField.validationMessage).toBe(
    CUSTOM_USERNAME_REQUIRED_MESSAGE,
  );

  // password
  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(false);
  expect(passwordField.validationMessage).toBe(
    "must have required property 'password'",
  );

  await user.type(screen.getByPlaceholderText(/username/i), 'joe');
  await user.type(screen.getByPlaceholderText(/password/i), 'password');

  // username
  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  // password
  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');
});
