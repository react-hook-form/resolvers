import * as v from '@badrap/valita';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { valitaResolver } from '..';

const USERNAME_REQUIRED_MESSAGE = 'username field is required';
const PASSWORD_REQUIRED_MESSAGE = 'password field is required';
const USERNAME_LENGTH_TOO_SHORT = 'username is too short';

function strRequired(message: string) {
  return (value: string) => {
    if (value === '') {
      return v.err(message);
    }
    return v.ok(value);
  };
}

function strMinLength(min: number) {
  return (value: string) => {
    if (value.length < min) {
      return v.err(USERNAME_LENGTH_TOO_SHORT);
    }
    return v.ok(value);
  };
}

const schema = v.object({
  username: v
    .string()
    .chain(strRequired(USERNAME_REQUIRED_MESSAGE))
    .chain(strMinLength(2)),
  password: v
    .string()
    .chain(strRequired(PASSWORD_REQUIRED_MESSAGE))
    .chain(strMinLength(2)),
});

type FormData = { username: string; password: string };

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valitaResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} placeholder="username" />
      {errors.username && <span role="alert">{errors.username.message}</span>}

      <input {...register('password')} />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit">submit</button>
    </form>
  );
}

describe('valita form validation errors', () => {
  test('ensure custom validation messages are shown', async () => {
    const handleSubmit = vi.fn();
    render(<TestComponent onSubmit={handleSubmit} />);

    expect(screen.queryAllByRole('alert')).toHaveLength(0);

    await user.type(screen.getByPlaceholderText('username'), 'a');
    await user.click(screen.getByText(/submit/i));

    expect(screen.getByText(/username is too short/i)).toBeInTheDocument();
    expect(screen.getByText(/password field is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

export function TestComponentManualType({
  onSubmit,
}: {
  onSubmit: (data: FormData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<v.Infer<typeof schema>, undefined, FormData>({
    resolver: valitaResolver(schema),
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
