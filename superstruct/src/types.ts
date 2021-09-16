import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';
import { validate, Struct } from 'superstruct';

type Options = Parameters<typeof validate>[2];

export type Resolver = <TFieldValues extends FieldValues, TContext>(
  schema: Struct<TFieldValues, any>,
  factoryOptions?: Options,
) => (
  values: unknown,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;
