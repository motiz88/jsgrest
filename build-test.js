var glob = require('glob-promise')
var PEG = require('pegjs');
var fs = require('mz/fs');
var fsExtra = require('fs-extra-promise');
var path = require('path');
var j = require('jscodeshift');
var babel = require('babel-core');

var indir = path.resolve(__dirname, 'test');
var outdir = path.resolve(__dirname, 'test-dist');
var pattern = path.join(indir, '**', '*.*');
var babelrc = path.resolve(__dirname, '.babelrc');

glob(pattern)
    .then(function(files) {
        return Promise.all(files.map(function(infile) {
            var relfile = path.relative(indir, infile);
            var outfile = path.resolve(outdir, relfile);
            console.log(infile);

            return fsExtra.mkdirpAsync(path.dirname(outfile))
                .then(function() {
                    if (/\.js$/.test(infile))
                        return fs.readFile(infile, 'utf8')
                            .then(function(source) {
                                console.log('distify', relfile);
                                return j(source).find(j.ImportDeclaration)
                                    .replaceWith(function(p) {
                                        return j.importDeclaration(p.node.specifiers,
                                            j.literal(
                                                p.node.source.value.replace(/\bsrc\b/g, 'dist'))
                                        );
                                    })
                                    .toSource({
                                        quote: 'single'
                                    });
                            })
                            .then(function(transformedCode) {
                                console.log('babel', relfile);
                                return babel.transform(transformedCode, {
                                    filename: infile,
                                    sourceRoot: indir,
                                    babelrc: true,
                                    ast: false,
                                    // extends: babelrc
                                }).code;
                            })
                            .then(function(transpiledCode) {
                                console.log('write', relfile);
                                return fs.writeFile(outfile, transpiledCode)
                                    .then(function() {
                                        console.log(outfile);
                                    });
                            });
                    else {
                        console.log('copy', relfile);
                        return fsExtra.copyAsync(infile, outfile)
                            .then(function() {
                                console.log(outfile);
                            });
                    }
                })
                .catch(function(err) {
                    console.error(relfile, err);
                    process.exit(64);
                });
        }));
    })
    .catch(function(err) {
        console.error(err);
        process.exit(64);
    });
