var glob = require('glob-promise')
var PEG = require('pegjs');
var fs = require('mz/fs');

if (process.argv.length < 3)
    throw new Error('Not enough arguments');

Promise.all(
        process.argv.slice(2)
        .map(glob)
        .map(function(filesPromise) {
            return filesPromise.then(function(files) {
                Promise.all(files.map(function(infile) {
                    return fs.readFile(infile, 'utf8')
                        .then(function(pegCode) {
                            return PEG.buildParser(pegCode, {output: 'source'});
                        })
                        .then(function(parserCode) {
                            return fs.writeFile(infile + '.js', parserCode)
                                .then(function() {
                                    console.log(infile + '.js');
                                });
                        });
                }));
            });
        })
    )
    .catch(function(err) {
        console.error(err.stack);
        process.exit(64);
    });
