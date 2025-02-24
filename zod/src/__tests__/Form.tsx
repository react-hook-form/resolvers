import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '..';

const schema = z.object({
  username: z.string().nonempty({ message: 'username field is required' }),
  password: z.string().nonempty({ message: 'password field is required' }),
});

type SchemaInput = z.input<typeof schema>;
type FormData = z.output<typeof schema> & { unusedProperty: string };

function TestComponent({
  onSubmit,
}: { onSubmit: (data: z.output<typeof schema>) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaInput, unknown, FormData>({
    resolver: zodResolver(schema), // Useful to check TypeScript regressions
    defaultValues: {
      username: '',
      password: '',
    },
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

test("form's validation with Zod and TypeScript's integration", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole('alert')).toHaveLength(0);

  await user.click(screen.getByText(/submit/i));

  expect(screen.getByText(/username field is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password field is required/i)).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
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
  } = useForm<SchemaInput, undefined, FormData>({
    resolver: zodResolver(schema), // Useful to check TypeScript regressions
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
