import fieldPathToSimpleName from '../../src/fieldPathToSimpleName';

describe('fieldPathToSimpleName', function() {
    it('should be defined', function() {
        fieldPathToSimpleName.should.exist;
        fieldPathToSimpleName.should.be.a('function');
    });

    it('field', function() {
        fieldPathToSimpleName('field')
            .should.equal('field');
    });

    it('_my_Field123_456', function() {
        fieldPathToSimpleName('_my_Field123_456')
            .should.equal('_my_Field123_456');
    });

    describe('json path', function() {
        it(`a->>'b'`, function() {
            fieldPathToSimpleName('a->>b')
                .should.equal('b');
        });

        it('a->b->c', function() {
            fieldPathToSimpleName('c')
                .should.equal('c');
        });

        it('A->b->>c', function() {
            fieldPathToSimpleName('A->b->>c')
                .should.equal('c');
        });
    });
});
