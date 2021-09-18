/* eslint-disable @typescript-eslint/ban-types */
import * as t from 'io-ts';
import {
  FieldError,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';

export type Resolver = <
  TFieldValues,
  TInput extends unknown = unknown,
  TContext extends object = object,
>(
  codec: t.Decoder<TInput, UnpackNestedValue<TFieldValues>>,
) => (
  values: TInput,
  _context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;

export type ErrorObject = Record<string, FieldError>;
export type FieldErrorWithPath = FieldError & { path: string };
