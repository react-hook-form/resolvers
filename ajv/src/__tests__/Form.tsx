import { act, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { JSONSchemaType } from 'ajv';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '..';

type FormData = { username: string; password: string };

const schema: JSONSchemaType<FormData> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'username field is required' },
    },
    password: {
      type: 'string',
      minLength: 1,
      errorMessage: { minLength: 'password field is required' },
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
    resolver: ajvResolver(schema), // Useful to check TypeScript regressions
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

test("form's validation with Ajv and TypeScript's integration", async () => {
  const handleSubmit = jest.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole(/alert/i)).toHaveLength(0);

  await act(async () => {
    user.click(screen.getByText(/submit/i));
  });

  expect(screen.getByText(/username field is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password field is required/i)).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
