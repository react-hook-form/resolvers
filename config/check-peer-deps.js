// Fails the build if a resolver adapter imports a validation library that is not
// declared as a peer dependency of the root package. Each adapter (`./zod`, `./yup`, …)
// reaches for its own validation library at runtime, so every one of those libraries has
// to appear in the root `peerDependencies` for package managers to see it — otherwise it
// is a phantom dependency, installed only by luck of hoisting. The version ranges stay
// hand-authored (a lib's supported range is not derivable from a single manifest); this
// script only guards completeness, so a newly added adapter cannot ship without its peer.
const fs = require('node:fs');
const path = require('node:path');
const { isBuiltin } = require('node:module');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));

// Adapter entry points: every `./<name>` subpath export that ships its own build.
const adapters = Object.keys(pkg.exports)
  .filter(
    (key) =>
      key.startsWith('./') && !key.includes('*') && key !== './package.json',
  )
  .map((key) => key.slice(2));

// Libraries the root package supplies itself, so an adapter may import them freely:
// react-hook-form (the always-present required peer), the package itself, and real
// runtime dependencies (e.g. @standard-schema/utils).
const provided = new Set([
  'react-hook-form',
  '@hookform/resolvers',
  ...Object.keys(pkg.dependencies ?? {}),
]);

const declaredPeers = new Set(Object.keys(pkg.peerDependencies ?? {}));

// 'zod/v4/core' -> 'zod', '@sinclair/typebox/value' -> '@sinclair/typebox'.
const toPackageName = (spec) =>
  spec.startsWith('@')
    ? spec.split('/').slice(0, 2).join('/')
    : spec.split('/')[0];

const isExternal = (spec) =>
  !spec.startsWith('.') &&
  !spec.startsWith('node:') &&
  !isBuiltin(toPackageName(spec));

const IMPORT_RE = /(?:from|import|require\()\s*['"]([^'"]+)['"]/g;

const collectImports = (dir) => {
  const specifiers = new Set();
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      // test files pull in unrelated dev deps
      if (entry.name === '__tests__') {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.tsx?$/.test(entry.name)) {
        const source = fs.readFileSync(full, 'utf8');
        for (const match of source.matchAll(IMPORT_RE)) {
          if (isExternal(match[1])) {
            specifiers.add(toPackageName(match[1]));
          }
        }
      }
    }
  };
  walk(dir);
  return specifiers;
};

const missing = [];
for (const adapter of adapters) {
  const srcDir = path.join(root, adapter, 'src');
  if (!fs.existsSync(srcDir)) {
    continue;
  }
  for (const name of collectImports(srcDir)) {
    if (!provided.has(name) && !declaredPeers.has(name)) {
      missing.push({ adapter, package: name });
    }
  }
}

if (missing.length) {
  console.error(
    '✖ Undeclared peer dependencies imported by resolver adapters:',
  );
  for (const { adapter, package: name } of missing) {
    console.error(
      `  - ${adapter} imports "${name}", missing from root peerDependencies`,
    );
  }
  console.error(
    '\nAdd each to the root package.json peerDependencies (optional) with a hand-picked range.',
  );
  process.exit(1);
}

console.log(
  `✓ peer deps: all ${adapters.length} resolver adapters declare their validation libraries.`,
);
