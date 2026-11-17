import { render, screen, waitFor } from '@testing-library/react';
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
  mode?: 'async' | 'sync';
}

function TestComponent({ onSubmit, mode }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: ajvResolver(schema, undefined, { mode }), // Useful to check TypeScript regressions
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

test.each([undefined, 'sync', 'async'] as const)(
  "form's validation with Ajv in %s mode",
  async (mode) => {
    const handleSubmit = vi.fn();
    render(<TestComponent onSubmit={handleSubmit} mode={mode} />);

    expect(screen.queryAllByRole('alert')).toHaveLength(0);

    await user.click(screen.getByText(/submit/i));

    expect(screen.getByText(/username field is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password field is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  },
);

test('submits valid values with async Ajv validation', async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} mode="async" />);
  const inputs = screen.getAllByRole('textbox');
  await user.type(inputs[0], 'username');
  await user.type(inputs[1], 'password');
  await user.click(screen.getByText(/submit/i));
  await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
  expect(handleSubmit.mock.calls[0][0]).toEqual({
    username: 'username',
    password: 'password',
  });
});
