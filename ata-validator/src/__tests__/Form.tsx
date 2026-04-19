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
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: ataResolver(schema),
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

test("form's validation with ata-validator and TypeScript's integration", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole('alert')).toHaveLength(0);

  await user.click(screen.getByText(/submit/i));

  expect(screen.queryAllByRole('alert').length).toBeGreaterThan(0);
  expect(handleSubmit).not.toHaveBeenCalled();
});
