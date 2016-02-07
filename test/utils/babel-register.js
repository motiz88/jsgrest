if (!process.env.BABEL_CACHE_PATH)
    process.env.BABEL_CACHE_PATH =
        require('path').resolve(__dirname, '..', '..', '.babel-cache', 'cache');
require('babel-core/register')({
    only: /jsgrest[\\\/](src|test)/
});
