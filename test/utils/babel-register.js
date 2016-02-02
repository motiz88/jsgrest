process.env.BABEL_CACHE_PATH = process.env.BABEL_CACHE_PATH || require('path').join(__dirname, '.babel-cache');
require('babel-core/register')({
    only: /jsgrest[\\\/](src|test)/
});
