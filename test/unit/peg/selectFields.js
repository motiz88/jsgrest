import dynamicRequire from '../../../src/peg/dynamicRequire';
const selectFieldsDynamic = dynamicRequire(require.resolve('../../../src/peg/selectFields'));
import selectFieldsCompiled from '../../../src/peg/selectFields.pegjs.js';

[{
    selectFields: selectFieldsDynamic,
    description: 'selectFields'
}, {
    selectFields: selectFieldsCompiled,
    description: 'selectFields compiled'
}]
.forEach(({selectFields, description}) => {
    describe(description, function() {
        it('should be defined', function() {
            selectFields.should.exist;
            selectFields.should.be.an('object');
        });

        describe('#parse', function() {
            it('should be defined', function() {
                selectFields.parse.should.exist;
                selectFields.parse.should.be.a('function');
            });

            it('empty list', function() {
                selectFields.parse('')
                    .should.deep.equal([]);
            });

            it('singleton list', function() {
                selectFields.parse('ack')
                    .should.deep.equal([{name: 'ack'}]);
            });

            it('simple list', function() {
                selectFields.parse('_1,_22,ack,pth')
                    .should.deep.equal([{name: '_1'}, {name: '_22'}, {name: 'ack'}, {name: 'pth'}]);
            });

            it('some casts', function() {
                selectFields.parse('_1,_22,ack::json,pth::varchar')
                    .should.deep.equal([{name: '_1'}, {name: '_22'}, {name: 'ack', cast: 'json'},
                        {name: 'pth', cast: 'varchar'}]);
            });
        });
    })
});

