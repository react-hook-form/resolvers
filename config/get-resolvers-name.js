const pkg = require('../package.json');

module.exports = function () {
  return Object.keys(pkg.exports)
    .map((e) => e.replace(/(\.\/|\.)/, '').replace(/package.*/, ''))
    .filter(Boolean);
};
