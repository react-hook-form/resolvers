import { readFileSync } from 'fs';
import { join } from 'path';

// `zod/v3` and `zod/v4/core` don't exist before zod@3.25.0. Importing either
// as a value (rather than `import type`) makes the compiled output reference
// that subpath at runtime, which breaks module resolution for anyone on an
// older zod 3.x — even if they never touch the zod4 code path (#811).
test('zod/v3 and zod/v4/core are only ever imported as types', () => {
  const source = readFileSync(join(__dirname, '..', 'zod.ts'), 'utf8');

  const v3Import = source.match(/^import .*'zod\/v3';$/m)?.[0];
  const v4Import = source.match(/^import .*'zod\/v4\/core';$/m)?.[0];

  expect(v3Import).toMatch(/^import type /);
  expect(v4Import).toMatch(/^import type /);
});
