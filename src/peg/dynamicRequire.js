module.exports = function dynamicRequire(path) {
    return require('pegjs')
    .buildParser(
        require('fs')
        .readFileSync(
            require.resolve(path), 'utf8'
        )
    );
};
