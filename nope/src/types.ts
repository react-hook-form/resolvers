import type {
  FieldValues,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';
import type { NopeObject } from 'nope-validator/lib/cjs/NopeObject';

type ValidateOptions = Parameters<NopeObject['validate']>[2];
type Context = Parameters<NopeObject['validate']>[1];

export type Resolver = <T extends NopeObject>(
  schema: T,
  schemaOptions?: ValidateOptions,
) => <TFieldValues extends FieldValues, TContext extends Context>(
  values: UnpackNestedValue<TFieldValues>,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;
