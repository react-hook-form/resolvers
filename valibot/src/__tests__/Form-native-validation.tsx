import { render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';
import { Resolver, useForm } from 'react-hook-form';
import * as v from 'valibot';
import { valibotResolver } from '..';

const USERNAME_REQUIRED_MESSAGE = 'username field is v.required';
const PASSWORD_REQUIRED_MESSAGE = 'password field is v.required';

const schema = v.object({
  username: v.pipe(
    v.string(USERNAME_REQUIRED_MESSAGE),
    v.minLength(2, USERNAME_REQUIRED_MESSAGE),
  ),
  password: v.pipe(
    v.string(PASSWORD_REQUIRED_MESSAGE),
    v.minLength(2, PASSWORD_REQUIRED_MESSAGE),
  ),
});

type FormData = { username: string; password: string };

interface Props {
  onSubmit: (data: FormData) => void;
  resolver: Resolver<FormData>;
}

function TestComponent({ onSubmit, resolver }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver,
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

test.each([
  ['async', valibotResolver(schema)],
  ['sync', valibotResolver(schema, undefined, { mode: 'sync' })],
  ['raw', valibotResolver(schema, undefined, { raw: true })],
  ['sync/raw', valibotResolver(schema, undefined, { mode: 'sync', raw: true })],
])("form's native validation with Valibot (%s)", async (_, resolver) => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} resolver={resolver} />);

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
  expect(handleSubmit).not.toHaveBeenCalled();

  await user.type(screen.getByPlaceholderText(/password/i), 'password');

  // password
  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');

  await user.type(usernameField, 'username');
  await user.click(screen.getByText(/submit/i));

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
  await waitFor(() => {
    expect(usernameField.validity.valid).toBe(true);
    expect(usernameField.validationMessage).toBe('');
    expect(passwordField.validity.valid).toBe(true);
    expect(passwordField.validationMessage).toBe('');
  });
  expect(usernameField.form?.checkValidity()).toBe(true);
  expect(handleSubmit.mock.calls[0][0]).toEqual({
    username: 'username',
    password: 'password',
  });
});
