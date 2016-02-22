import dynamicPegRequire from '../../../src/peg/dynamicRequire';
const fieldPathParserDynamic = dynamicPegRequire('./fieldPath.pegjs');
import fieldPathParserCompiled from '../../../src/peg/fieldPath.pegjs.js';

[{
    fieldPathParser: fieldPathParserDynamic,
    description: 'fieldPathParser'
}, {
    fieldPathParser: fieldPathParserCompiled,
    description: 'fieldPathParser compiled'
}]
.forEach(({fieldPathParser, description}) => {
    describe(description, function() {
        it('should be defined', function() {
            fieldPathParser.should.exist;
            fieldPathParser.should.be.an('object');
        });

        describe('#parse', function() {
            it('should be defined', function() {
                fieldPathParser.parse.should.exist;
                fieldPathParser.parse.should.be.a('function');
            });

            it('should parse a simple field name as a one-part path', function() {
                fieldPathParser.parse('_my_Field123_456')
                    .should.deep.equal([{type: 'field', name: '_my_Field123_456'}]);
            });

            describe('json path', function() {
                it('should parse a->>b', function() {
                    fieldPathParser.parse('a->>b')
                    .should.deep.equal([
                        {type: 'field', name: 'a'},
                        {type: '->>', name: 'b'},
                    ]);
                });

                it('should parse a->b->>c', function() {
                    fieldPathParser.parse('a->b->>c')
                    .should.deep.equal([
                        {type: 'field', name: 'a'},
                        {type: '->', name: 'b'},
                        {type: '->>', name: 'c'},
                    ]);
                });
            });
        });
    });
});
