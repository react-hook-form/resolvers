/* eslint-disable @typescript-eslint/ban-types */
import type {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';
import { ValidationState, StrictValidator } from 'typanion';

type ValidateOptions = Pick<ValidationState, 'coercions' | 'coercion'>;

type RHFResolver<
  TFieldValues extends FieldValues,
  TInput = unknown,
  TContext extends Object = object,
> = (
  values: TInput,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;

export type Resolver = <
  TInput extends FieldValues = FieldValues,
  TFieldValues extends TInput = TInput,
  TContext extends object = object,
>(
  validator: StrictValidator<TInput, TFieldValues>,
  validatorOptions?: ValidateOptions,
) => RHFResolver<TFieldValues, TInput, TContext>;
