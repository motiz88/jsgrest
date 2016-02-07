import requestToOrderClause from '../../src/query/requestToOrderClause';
import {expect} from 'chai';

describe('requestToOrderClause', function() {
    it('should be a function', function() {
        expect(requestToOrderClause).to.exist
            .and.to.be.a('function');
    });

    it('should return empty string if order unspecified', function() {
        requestToOrderClause({})
            .should.equal('');
        requestToOrderClause({query: {}})
            .should.equal('');
        requestToOrderClause({query: {order: ''}})
            .should.equal('');
    });

    it('?order=Col --> ORDER BY "Col" ASC', function() {
        requestToOrderClause({query: {order: 'Col'}})
            .should.equal('ORDER BY "Col" ASC');
    });

    it('?order=Col.desc --> ORDER BY "Col" DESC', function() {
        requestToOrderClause({query: {order: 'Col.desc'}})
            .should.equal('ORDER BY "Col" DESC');
    });

    it('?order=Col.asc --> ORDER BY "Col" ASC', function() {
        requestToOrderClause({query: {order: 'Col.asc'}})
            .should.equal('ORDER BY "Col" ASC');
    });

    it('?order=ColA.asc,ColB.desc --> ORDER BY "ColA" ASC, "ColB" DESC', function() {
        requestToOrderClause({query: {order: 'ColA.asc,ColB.desc'}})
            .should.equal('ORDER BY "ColA" ASC, "ColB" DESC');
    });

    it('?order=ColA,ColB.desc --> ORDER BY "ColA" ASC, "ColB" DESC', function() {
        requestToOrderClause({query: {order: 'ColA,ColB.desc'}})
            .should.equal('ORDER BY "ColA" ASC, "ColB" DESC');
    });

    it('?order=Col.nullsfirst --> ORDER BY "Col" ASC NULLS FIRST', function() {
        requestToOrderClause({query: {order: 'Col.nullsfirst'}})
            .should.equal('ORDER BY "Col" ASC NULLS FIRST');
    });

    it('?order=Col.asc.nullsfirst --> ORDER BY "Col" ASC NULLS FIRST', function() {
        requestToOrderClause({query: {order: 'Col.asc.nullsfirst'}})
            .should.equal('ORDER BY "Col" ASC NULLS FIRST');
    });

    it('?order=Col.asc.nullslast --> ORDER BY "Col" ASC NULLS LAST', function() {
        requestToOrderClause({query: {order: 'Col.asc.nullslast'}})
            .should.equal('ORDER BY "Col" ASC NULLS LAST');
    });
});
