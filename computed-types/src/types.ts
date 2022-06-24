import type {
  FieldValues,
  ResolverResult,
  ResolverOptions,
} from 'react-hook-form';

export type Resolver = (
  schema: any,
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
