import { Type } from '@sinclair/typebox';
import { FieldValues, ResolverResult, ResolverOptions } from 'react-hook-form';

export type Resolver = <T extends ReturnType<typeof Type.Object>>(
  schema: T,
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
