import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ataResolver } from '..';

type FormData = { username: string; password: string };

const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1,
    },
    password: {
      type: 'string',
      minLength: 1,
    },
  },
  required: ['username', 'password'],
  additionalProperties: false,
};

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: ataResolver(schema),
    shouldUseNativeValidation: true,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} placeholder="username" />

      <input {...register('password')} placeholder="password" />

      <button type="submit">submit</button>
    </form>
  );
}

test("form's native validation with ata-validator", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  let usernameField = screen.getByPlaceholderText(
    /username/i,
  ) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  let passwordField = screen.getByPlaceholderText(
    /password/i,
  ) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');

  await user.click(screen.getByText(/submit/i));

  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(false);

  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(false);

  await user.type(screen.getByPlaceholderText(/username/i), 'joe');
  await user.type(screen.getByPlaceholderText(/password/i), 'password');

  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');
});
