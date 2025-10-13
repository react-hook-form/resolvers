import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { v } from 'convex/values';
import React from 'react';
import { useForm } from 'react-hook-form';
import { convexResolver } from '../convex';

const USERNAME_REQUIRED_MESSAGE = 'username field is required';
const PASSWORD_REQUIRED_MESSAGE = 'New Password is required';

const schema = v.object({
  username: v.string(),
  password: v.string(),
});

type FormData = {
  username?: string;
  password?: string;
};

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: convexResolver(schema),
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

test("form's validation with Convex resolver and TypeScript's integration", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole('alert')).toHaveLength(0);

  await user.click(screen.getByText(/submit/i));

  expect(screen.getByText(USERNAME_REQUIRED_MESSAGE)).toBeInTheDocument();
  expect(screen.getByText(PASSWORD_REQUIRED_MESSAGE)).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
