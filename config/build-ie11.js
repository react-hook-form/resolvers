const path = require('path');
const fs = require('fs');
const microbundle = require('microbundle');
const moveFile = require('move-file');
const getResolversName = require('./get-resolvers-name');

const IE11_PATH = 'ie11';
const OUTPUT = 'dist';

(async () => {
  console.log(`Build IE11 resolvers to ${OUTPUT}`);
  const resolvers = getResolversName();

  for await (let resolver of resolvers) {
    console.log(`> Build ${resolver}`);
    const filePath = path.join(resolver, 'package.json');

    const resolverPkg = JSON.parse(fs.readFileSync(filePath));
    const resolverPkgCopy = Object.assign({}, resolverPkg);

    // Temporary update `types` field
    resolverPkg.types = `${IE11_PATH}/index.d.ts`;

    await fs.writeFileSync(filePath, JSON.stringify(resolverPkg, null, 2));

    try {
      await microbundle({
        cwd: resolver,
        output: IE11_PATH,
        globals: '@hookform/resolvers=hookformResolvers',
        format: 'cjs',
        alias: 'react-hook-form=react-hook-form/dist/index.ie11',
      });

      // Move `./{resolver}/ie11` -> `./dist/ie11/{resolver}`
      await moveFile(
        `${resolver}/${IE11_PATH}`,
        `${OUTPUT}/${IE11_PATH}/${resolver}`,
        {
          overwrite: true,
        },
      );
    } catch (error) {
      console.error(error);
      process.exit(1);
    } finally {
      // Revert back changes on `{resolver}/package.json`
      await fs.writeFileSync(
        filePath,
        JSON.stringify(resolverPkgCopy, null, 2),
      );
    }
  }
})();
