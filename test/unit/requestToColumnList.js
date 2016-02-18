import requestToColumnList from '../../src/query/requestToColumnList';
import {expect} from 'chai';

describe('requestToColumnList', function() {
    it('should be a function', function() {
        expect(requestToColumnList).to.exist
            .and.to.be.a('function');
    });

    it('should return * if select unspecified', function() {
        requestToColumnList({})
            .should.equal('*');
        requestToColumnList({query: {}})
            .should.equal('*');
        requestToColumnList({query: {select: ''}})
            .should.equal('*');
    });

    it('?select=Col --> "Col"', function() {
        requestToColumnList({query: {select: 'Col'}})
            .should.equal('"Col"');
    });

    it('?select=ColA,ColB --> "ColA", "ColB"', function() {
        requestToColumnList({query: {select: 'ColA,ColB'}})
            .should.equal('"ColA", "ColB"');
    });

    it('?select=ColB,ColA --> "ColB", "ColA"', function() {
        requestToColumnList({query: {select: 'ColB,ColA'}})
            .should.equal('"ColB", "ColA"');
    });

    it('ignore whitespace', function() {
        requestToColumnList({query: {select: 'a, b, C '}})
            .should.equal('a, b, "C"');
    });

    it('with casting', function() {
        requestToColumnList({query: {select: 'Col::text'}})
            .should.equal('"Col"::text');
    });

    it('escapes anything suspicious', function() {
        requestToColumnList({query: {select: '* FROM Students; DROP TABLE Students; --'}})
            .should.equal('"* FROM Students; DROP TABLE Students; --"');
        requestToColumnList({query: {select: '*" FROM Students; DROP TABLE Students; --'}})
            .should.equal('"*"" FROM Students; DROP TABLE Students; --"');
    });
});
