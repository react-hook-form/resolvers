import type {
  FieldValues,
  ResolverResult,
  UnpackNestedValue,
  ResolverOptions,
} from 'react-hook-form';

export type Resolver = (
  schema: any,
) => <TFieldValues extends FieldValues, TContext>(
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
