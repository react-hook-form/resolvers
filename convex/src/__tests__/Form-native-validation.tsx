import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { convexResolver } from '../convex';
import { schema } from './__fixtures__/data';

const USERNAME_REQUIRED_MESSAGE = 'username field is required';
const PASSWORD_REQUIRED_MESSAGE = 'New Password is required';

function TestComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: convexResolver(schema),
    shouldUseNativeValidation: true,
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input {...register('username')} />
      {errors.username && <span role="alert">{errors.username.message}</span>}

      <input {...register('password')} />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit">submit</button>
    </form>
  );
}

test('Form validation with Convex resolver using native validation', async () => {
  render(<TestComponent />);

  expect(screen.queryAllByRole('alert')).toHaveLength(0);

  await user.click(screen.getByText(/submit/i));

  expect(screen.getByText(USERNAME_REQUIRED_MESSAGE)).toBeInTheDocument();
  expect(screen.getByText(PASSWORD_REQUIRED_MESSAGE)).toBeInTheDocument();
});
