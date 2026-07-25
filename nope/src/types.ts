import type { object as nopeObject } from 'nope-validator';
import type {
  FieldValues,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';

// nope-validator doesn't publicly export the `NopeObject` class itself (and
// its internal file layout has changed across major versions), so it's
// derived here from the return type of its exported `object()` factory
// instead of depending on an unstable, non-exported module path.
type NopeObject = ReturnType<typeof nopeObject>;

type ValidateOptions = Parameters<NopeObject['validate']>[2];
type Context = Parameters<NopeObject['validate']>[1];

export type Resolver = <T extends NopeObject>(
  schema: T,
  schemaOptions?: ValidateOptions,
  resolverOptions?: { mode?: 'async' | 'sync'; rawValues?: boolean },
) => <TFieldValues extends FieldValues, TContext extends Context>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;
