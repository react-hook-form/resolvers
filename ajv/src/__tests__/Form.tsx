import { render, screen } from '@testing-library/react';
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
  errorMessage: {
    required: {
      username: 'Username is required',
    },
  },
};

interface Props {
  onSubmit: (data: FormData) => void;
  isInitialValueUndefined?: boolean;
}

function TestComponent({ onSubmit, isInitialValueUndefined }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: ajvResolver(schema), // Useful to check TypeScript regressions
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username', {
          setValueAs: (value) =>
            isInitialValueUndefined ? value || undefined : value,
        })}
      />
      {errors.username && <span role="alert">{errors.username.message}</span>}

      <input
        {...register('password', {
          setValueAs: (value) =>
            isInitialValueUndefined ? value || undefined : value,
        })}
      />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit">submit</button>
    </form>
  );
}

test("form's validation with Ajv and TypeScript's integration", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole('alert')).toHaveLength(0);

  await user.click(screen.getByText(/submit/i));

  expect(screen.getByText(/username field is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password field is required/i)).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});

test("form's validation with Ajv and TypeScript's integration for required fields with custom error messages", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent isInitialValueUndefined onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole('alert')).toHaveLength(0);

  await user.click(screen.getByText(/submit/i));

  expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
  expect(
    screen.getByText(/must have required property 'password'/i),
  ).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
