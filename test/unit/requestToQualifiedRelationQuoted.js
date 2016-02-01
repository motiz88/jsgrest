import requestToQualifiedRelationQuoted from '../../src/query/requestToQualifiedRelationQuoted';
import {expect} from 'chai';

describe('requestToQualifiedRelationQuoted', function() {
    it('should be a function', function() {
        expect(requestToQualifiedRelationQuoted).to.exist
            .and.to.be.a('function');
    });

    it('public.tab', function() {
        requestToQualifiedRelationQuoted({dbConfig: {schema: 'public'}, params: {relation: 'tab'}})
            .should.equal('public.tab');
    });

    it('public."aTable"', function() {
        requestToQualifiedRelationQuoted({
            dbConfig: {schema: 'public'},
            params: {relation: 'aTable'}
        }).should.equal('public."aTable"');
    });

    it('public."""weird chars"', function() {
        requestToQualifiedRelationQuoted({
            dbConfig: {schema: 'public'},
            params: {relation: '"weird chars'}
        }).should.equal('public."""weird chars"');
    });

    it('"1 "." spaces"', function() {
        requestToQualifiedRelationQuoted({dbConfig: {schema: '1 '}, params: {relation: ' spaces'}})
            .should.equal('"1 "." spaces"');
    });
});
