import * as t from 'io-ts';
import { IntersectionType, TaggedUnionType, UnionType } from 'io-ts';
import { absurd, flow, identity, not, pipe } from 'fp-ts/function';
import * as ReadonlyArray from 'fp-ts/ReadonlyArray';
import * as Option from 'fp-ts/Option';
import * as Either from 'fp-ts/Either';
import * as SemiGroup from 'fp-ts/Semigroup';
import { FieldError } from 'react-hook-form';
import arrayToPath from './arrayToPath';

const formatErrorPath = (context: t.Context): string =>
  pipe(
    context,
    ReadonlyArray.filterMapWithIndex((index, contextEntry) => {
      const previousIndex = index - 1;

      const shouldBeFiltered =
        context[previousIndex] === undefined ||
        context[previousIndex].type instanceof TaggedUnionType ||
        context[previousIndex].type instanceof UnionType ||
        context[previousIndex].type instanceof IntersectionType;

      return shouldBeFiltered ? Option.none : Option.some(contextEntry);
    }),
    ReadonlyArray.map(({ key }) => key),
    ReadonlyArray.map((key) =>
      pipe(
        key,
        (k) => parseInt(k, 10),
        Either.fromPredicate(not<number>(Number.isNaN), () => key),
      ),
    ),
    ReadonlyArray.toArray,
    arrayToPath,
  );

type ErrorObject = Record<string, FieldError>;

const formatError = (e: t.ValidationError): ErrorObject => {
  const path = formatErrorPath(e.context);

  const message = pipe(
    e.message,
    Either.fromNullable(e.context),
    Either.mapLeft(
      flow(
        ReadonlyArray.last,
        Option.map(
          (contextEntry) =>
            `expected ${contextEntry.type.name} but got ${JSON.stringify(
              contextEntry.actual,
            )}`,
        ),
        Option.getOrElseW(() =>
          absurd<string>('Error context is missing name' as never),
        ),
      ),
    ),
    Either.getOrElseW(identity),
  );

  const type = pipe(
    e.context,
    ReadonlyArray.last,
    Option.map((contextEntry) => contextEntry.type.name),
    Option.getOrElse(() => 'unknown'),
  );

  return { [path]: { message, type } };
};

const concatObjects = (a: ReadonlyArray<ErrorObject>): ErrorObject =>
  SemiGroup.fold(SemiGroup.getObjectSemigroup<ErrorObject>())({}, a);

const errorsToRecord = flow(
  Either.mapLeft(flow(ReadonlyArray.map(formatError), concatObjects)),
);

export default errorsToRecord;
