import { Schema } from '@effect/schema';
import { ParseOptions } from '@effect/schema/AST';
import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';

export type Resolver = <TFieldValues extends FieldValues, TContext>(
  schema: Schema.Schema<TFieldValues>,
  config?: ParseOptions,
) => (
  values: FieldValues,
  _context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
