import { FieldValues, ResolverResult, ResolverOptions } from 'react-hook-form';
import { BaseSchema, BaseSchemaAsync, ParseInfo } from 'valibot';

export type Resolver = <T extends BaseSchema | BaseSchemaAsync>(
  schema: T,
  schemaOptions?: Partial<Pick<ParseInfo, 'abortEarly' | 'abortPipeEarly'>>,
  resolverOptions?: {
    /**
     * @default async
     */
    mode?: 'sync' | 'async';
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
