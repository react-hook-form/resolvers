import { Schema } from '@effect/schema';
import { ParseOptions } from '@effect/schema/AST';
import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';

export type Resolver = <TFieldValues extends FieldValues, TContext = any>(
  schema: Schema.Schema<TFieldValues>,
  config?: ParseOptions,
) => (
  values: FieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
