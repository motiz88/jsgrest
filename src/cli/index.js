import cli from './core';

cli(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(64);
    });
