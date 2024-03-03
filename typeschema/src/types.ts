import { FieldValues, ResolverResult, ResolverOptions } from 'react-hook-form';
import type { Schema } from '@typeschema/main';

export type Resolver = <T extends Schema>(
  schema: T,
  schemaOptions?: never,
  factoryOptions?: {
    /**
     * Return the raw input values rather than the parsed values.
     * @default false
     */
    raw?: boolean;
  },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;
