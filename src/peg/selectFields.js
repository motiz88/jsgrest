if (process.env.USE_PEGJS_REQUIRE)
    module.exports = require('./dynamicRequire')('./selectFields.pegjs');
else
    module.exports = require('./selectFields.pegjs.js');
