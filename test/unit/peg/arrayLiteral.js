import dynamicRequire from '../../../src/peg/dynamicRequire';
const arrayLiteralParserDynamic = dynamicRequire(require.resolve('../../../src/peg/arrayLiteral.pegjs'));
import arrayLiteralParserCompiled from '../../../src/peg/arrayLiteral.pegjs.js';

[{
    arrayLiteralParser: arrayLiteralParserDynamic,
    description: 'arrayLiteralParser'
}, {
    arrayLiteralParser: arrayLiteralParserCompiled,
    description: 'arrayLiteralParser compiled'
}]
.forEach(({arrayLiteralParser, description}) => {
    describe(description, function() {
        it('should be defined', function() {
            arrayLiteralParser.should.exist;
            arrayLiteralParser.should.be.an('object');
        });

        describe('#parse', function() {
            it('should be defined', function() {
                arrayLiteralParser.parse.should.exist;
                arrayLiteralParser.parse.should.be.a('function');
            });

            it('empty array', function() {
                arrayLiteralParser.parse('{}')
                    .should.deep.equal([]);
            });

            it('simple array', function() {
                arrayLiteralParser.parse('{1,2,ack,pth}')
                    .should.deep.equal(['1', '2', 'ack', 'pth']);
            });

            it('array of arrays', function() {
                arrayLiteralParser.parse('{{1,2,ack,pth},{foo},bar}')
                    .should.deep.equal([['1', '2', 'ack', 'pth'], ['foo'], 'bar']);
            });
        });
    });
});
