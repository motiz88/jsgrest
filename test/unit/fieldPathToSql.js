import fieldPathToSql from '../../src/fieldPathToSql';

describe('fieldPathToSql', function() {
    it('should be defined', function() {
        fieldPathToSql.should.exist;
        fieldPathToSql.should.be.a('function');
    });

    it('field', function() {
        fieldPathToSql('field')
            .should.equal('field');
    });

    it('"_my_Field123_456"', function() {
        fieldPathToSql('_my_Field123_456')
            .should.equal('"_my_Field123_456"');
    });

    describe('json path', function() {
        it(`a->>'b'`, function() {
            fieldPathToSql('a->>b')
                .should.equal(`a->>'b'`);
        });

        it(`a->'b'->'c'`, function() {
            fieldPathToSql('a->b->>c')
                .should.equal(`a->'b'->>'c'`);
        });

        it(`"A"->'b'->>'c'`, function() {
            fieldPathToSql('A->b->>c')
                .should.equal(`"A"->'b'->>'c'`);
        });
    });
});
