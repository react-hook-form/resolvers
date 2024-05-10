import { Schema } from '@effect/schema';
import { ParseOptions } from '@effect/schema/AST';
import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';

export type Resolver = <A extends FieldValues, I, TContext>(
  schema: Schema.Schema<A, I>,
  config?: ParseOptions,
) => (
  values: FieldValues,
  _context: TContext | undefined,
  options: ResolverOptions<A>,
) => Promise<ResolverResult<A>>;
