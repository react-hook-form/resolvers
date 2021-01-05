import React from 'react';
import { render, screen, act } from '@testing-library/react';
import user from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import * as Zod from 'zod';
import { zodResolver } from '..';

const schema = Zod.object({
  username: Zod.string().nonempty({ message: 'username field is required' }),
  password: Zod.string().nonempty({ message: 'password field is required' }),
});

type FormData = Zod.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const { register, errors, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema), // Useful to check TypeScript regressions
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="username" ref={register} />
      {errors.username && <span role="alert">{errors.username.message}</span>}

      <input name="password" ref={register} />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit">submit</button>
    </form>
  );
}

test("form's validation with Zod and TypeScript's integration", async () => {
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
