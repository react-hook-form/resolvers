import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import vine from '@vinejs/vine';
import { Infer } from '@vinejs/vine/build/src/types';
import React from 'react';
import { useForm } from 'react-hook-form';
import { vineResolver } from '..';

const schema = vine.compile(
  vine.object({
    username: vine.string().minLength(1),
    password: vine.string().minLength(1),
  }),
);

type FormData = Infer<typeof schema> & { unusedProperty: string };

function TestComponent({
  onSubmit,
}: { onSubmit: (data: Infer<typeof schema>) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: vineResolver(schema), // Useful to check TypeScript regressions
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

test("form's validation with Vine and TypeScript's integration", async () => {
  const handleSubmit = vi.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole('alert')).toHaveLength(0);

  await user.click(screen.getByText(/submit/i));

  expect(
    screen.getByText(/The username field must have at least 1 characters/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/The password field must have at least 1 characters/i),
  ).toBeInTheDocument();
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
  } = useForm<Infer<typeof schema>, undefined, FormData>({
    resolver: vineResolver(schema), // Useful to check TypeScript regressions
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
