import * as t from 'io-ts';
import {
  FieldValues,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';

export type Resolver = <T, TFieldValues, TContext>(
  codec: t.Decoder<FieldValues, T>,
) => (
  values: UnpackNestedValue<TFieldValues>,
  _context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;
