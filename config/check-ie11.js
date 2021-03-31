const fs = require('fs');
const getResolversName = require('./get-resolvers-name');

(async () => {
  console.log('Checking IE11 bundles...');
  const resolvers = getResolversName();

  for await (const resolver of resolvers) {
    console.log(`> Checking ${resolver} IE11 bundle`);
    const file = fs.readFileSync(`dist/ie11/${resolver}/${resolver}.js`);

    if (!file.includes('react-hook-form/dist/index.ie11')) {
      throw new Error(
        'IE11 bundle should require `react-hook-form/dist/index.ie11`',
      );
    }
  }
})();
