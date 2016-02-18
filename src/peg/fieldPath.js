if (process.env.USE_PEGJS_REQUIRE)
    module.exports = require('./dynamicRequire')('./fieldPath.pegjs');
else
    module.exports = require('./fieldPath.pegjs.js');
