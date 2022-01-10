import React from 'react';
import { render, screen, act } from '@testing-library/react';
import user from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import * as vest from 'vest';
import { vestResolver } from '..';

interface FormData {
  username: string;
  password: string;
}

const validationSuite = vest.create('form', (data: FormData) => {
  vest.test('username', 'Username is required', () => {
    vest.enforce(data.username).isNotEmpty();
  });

  vest.test('password', 'Password must contain a symbol', () => {
    vest.enforce(data.password).matches(/[^A-Za-z0-9]/);
  });
});

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: vestResolver(validationSuite), // Useful to check TypeScript regressions
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <span role="alert">{errors.username.message}</span>}

      <input {...register('password')} />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit">submit</button>
    </form>
  );
}

test("form's validation with Vest and TypeScript's integration", async () => {
  const handleSubmit = jest.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole(/alert/i)).toHaveLength(0);

  await act(async () => {
    user.click(screen.getByText(/submit/i));
  });

  expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Password must contain a symbol/i),
  ).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
