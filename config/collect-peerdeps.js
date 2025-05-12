import fs from 'node:fs/promises';
import { join } from 'node:path';

const packageJsons = await Promise.all(
  (await fs.readdir('./')).map((p) =>
    fs
      .readFile(join(p, 'package.json'))
      .then(JSON.parse)
      .catch((e) => {}),
  ),
);

const peerDependencies = Object.fromEntries(
  packageJsons.flatMap((pj) => Object.entries(pj?.peerDependencies ?? {})),
);

const peerDependenciesMeta = Object.fromEntries(
  Object.entries(peerDependencies).map(([pName]) => [
    pName,
    { optional: true },
  ]),
);

const packageJson = {
  ...JSON.parse(await fs.readFile('package.json')),
  peerDependencies,
  peerDependenciesMeta,
};

await fs.writeFile(
  'package.json',
  `${JSON.stringify(packageJson, null, 2)}\n`, // newline at EOF
);
