import * as t from 'io-ts';
import {
  FieldError,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';

export type Resolver = <TFieldValues, TContext>(
  codec: t.Decoder<unknown, any>,
) => (
  values: UnpackNestedValue<TFieldValues>,
  _context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;

export type ErrorObject = Record<string, FieldError>;
export type FieldErrorWithPath = FieldError & { path: string };
