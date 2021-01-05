import React from 'react';
import { render, screen, act } from '@testing-library/react';
import user from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { object, string, Infer, size } from 'superstruct';
import { superstructResolver } from '..';

const schema = object({
  username: size(string(), 2),
  password: size(string(), 6),
});

type FormData = Infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const { register, errors, handleSubmit } = useForm<FormData>({
    resolver: superstructResolver(schema), // Useful to check TypeScript regressions
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

test("form's validation with Superstruct and TypeScript's integration", async () => {
  const handleSubmit = jest.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole(/alert/i)).toHaveLength(0);

  await act(async () => {
    user.click(screen.getByText(/submit/i));
  });

  expect(
    screen.getByText(
      /Expected a string with a length of `2` but received one with a length of `0`/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /Expected a string with a length of `6` but received one with a length of `0`/i,
    ),
  ).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
