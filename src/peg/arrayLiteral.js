/* istanbul ignore next */
if (process.env.USE_PEGJS_REQUIRE)
    module.exports = require('./dynamicRequire')('./arrayLiteral.pegjs');
else
    module.exports = require('./arrayLiteral.pegjs.js');
