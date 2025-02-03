import { StandardSchemaV1 } from '@standard-schema/spec';
import { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';

export type Resolver = <T extends StandardSchemaV1<any, any>>(
  schema: T,
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
