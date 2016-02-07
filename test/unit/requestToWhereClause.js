import requestToWhereClause from '../../src/query/requestToWhereClause';
import {expect} from 'chai';

describe('requestToWhereClause', function() {
    it('should be a function', function() {
        expect(requestToWhereClause).to.exist
            .and.to.be.a('function');
    });

    it('should return empty string if filter unspecified', function() {
        requestToWhereClause({})
            .should.equal('');
        requestToWhereClause({query: {}})
            .should.equal('');
        requestToWhereClause({query: {order: ''}})
            .should.equal('');
    });

    describe('operator eq', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'eq.0'}})
                .should.equal('WHERE col = \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.eq.0'}})
                .should.equal('WHERE NOT (col = \'0\')');
        });
    });

    describe('operator neq', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'neq.0'}})
                .should.equal('WHERE col <> \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.neq.0'}})
                .should.equal('WHERE NOT (col <> \'0\')');
        });
    });

    describe('operator gt', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'gt.0'}})
                .should.equal('WHERE col > \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.gt.0'}})
                .should.equal('WHERE NOT (col > \'0\')');
        });
    });

    describe('operator lt', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'lt.0'}})
                .should.equal('WHERE col < \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.lt.0'}})
                .should.equal('WHERE NOT (col < \'0\')');
        });
    });

    describe('operator gte', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'gte.0'}})
                .should.equal('WHERE col >= \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.gte.0'}})
                .should.equal('WHERE NOT (col >= \'0\')');
        });
    });

    describe('operator lte', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'lte.0'}})
                .should.equal('WHERE col <= \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.lte.0'}})
                .should.equal('WHERE NOT (col <= \'0\')');
        });
    });

    describe('operator <@', function() {
        it('TODO: should be recognized with array literal', function() {
            requestToWhereClause({query: {col: '<@.{0}'}})
                .should.equal('WHERE col <@ {\'0\'}');
        });
        it('TODO: should be recognized with array literal in the negative', function() {
            requestToWhereClause({query: {col: 'not.<@.{0}'}})
                .should.equal('WHERE NOT (col <@ {\'0\'})');
        });
    });

    describe('operator @>', function() {
        it('TODO: should be recognized with array literal', function() {
            requestToWhereClause({query: {col: '@>.{0}'}})
                .should.equal('WHERE col @> {\'0\'}');
        });
        it('TODO: should be recognized with array literal in the negative', function() {
            requestToWhereClause({query: {col: 'not.@>.{0}'}})
                .should.equal('WHERE NOT (col @> {\'0\'})');
        });
    });

    describe('operator is', function() {
        it('should be recognized with NULL', function() {
            requestToWhereClause({query: {col: 'is.null'}})
                .should.equal('WHERE col IS NULL');
        });
        it('should be recognized with NULL in the negative', function() {
            requestToWhereClause({query: {col: 'not.is.null'}})
                .should.equal('WHERE NOT (col IS NULL)');
        });
        it('should be recognized with TRUE', function() {
            requestToWhereClause({query: {col: 'is.true'}})
                .should.equal('WHERE col IS TRUE');
        });
        it('should be recognized with FALSE', function() {
            requestToWhereClause({query: {col: 'is.false'}})
                .should.equal('WHERE col IS FALSE');
        });
        it('should escape any other string', function() {
            requestToWhereClause({query: {col: 'is.drop'}})
                .should.equal('WHERE col IS \'drop\'');
        });
    });

    describe('operator isnot', function() {
        it('should be recognized with NULL', function() {
            requestToWhereClause({query: {col: 'isnot.null'}})
                .should.equal('WHERE col IS NOT NULL');
        });
        it('should be recognized with NULL in the negative', function() {
            requestToWhereClause({query: {col: 'not.isnot.null'}})
                .should.equal('WHERE NOT (col IS NOT NULL)');
        });
        it('should be recognized with TRUE', function() {
            requestToWhereClause({query: {col: 'isnot.true'}})
                .should.equal('WHERE col IS NOT TRUE');
        });
        it('should be recognized with FALSE', function() {
            requestToWhereClause({query: {col: 'isnot.false'}})
                .should.equal('WHERE col IS NOT FALSE');
        });
        it('should escape any other string', function() {
            requestToWhereClause({query: {col: 'isnot.drop'}})
                .should.equal('WHERE col IS NOT \'drop\'');
        });
    });

    describe('operator in', function() {
        it('should be recognized with a list', function() {
            requestToWhereClause({query: {col: 'in.0,1,2'}})
                .should.equal('WHERE col IN (\'0\',\'1\',\'2\')');
        });
        it('should be recognized with a list in the negative', function() {
            requestToWhereClause({query: {col: 'not.in.0,1,2'}})
                .should.equal('WHERE NOT (col IN (\'0\',\'1\',\'2\'))');
        });
    });

    describe('operator notin', function() {
        it('should be recognized with a list', function() {
            requestToWhereClause({query: {col: 'notin.0,1,2'}})
                .should.equal('WHERE col NOT IN (\'0\',\'1\',\'2\')');
        });
        it('should be recognized with a list in the negative', function() {
            requestToWhereClause({query: {col: 'not.notin.0,1,2'}})
                .should.equal('WHERE NOT (col NOT IN (\'0\',\'1\',\'2\'))');
        });
    });

    describe('operator @@', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: '@@.0'}})
                .should.equal('WHERE col @@ to_tsquery(\'0\')');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.@@.0'}})
                .should.equal('WHERE NOT (col @@ to_tsquery(\'0\'))');
        });
    });

    describe('operator like', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'like.0'}})
                .should.equal('WHERE col LIKE \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.like.0'}})
                .should.equal('WHERE NOT (col LIKE \'0\')');
        });
        it('should translate wildcards', function() {
            requestToWhereClause({query: {col: 'like.0*'}})
                .should.equal('WHERE col LIKE \'0%\'');
            requestToWhereClause({query: {col: 'like.0*1*'}})
                .should.equal('WHERE col LIKE \'0%1%\'');
            requestToWhereClause({query: {col: 'like.*0'}})
                .should.equal('WHERE col LIKE \'%0\'');
        });
    });

    describe('operator ilike', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'ilike.0'}})
                .should.equal('WHERE col ILIKE \'0\'');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.ilike.0'}})
                .should.equal('WHERE NOT (col ILIKE \'0\')');
        });
        it('should translate wildcards', function() {
            requestToWhereClause({query: {col: 'ilike.0*'}})
                .should.equal('WHERE col ILIKE \'0%\'');
            requestToWhereClause({query: {col: 'ilike.0*1*'}})
                .should.equal('WHERE col ILIKE \'0%1%\'');
            requestToWhereClause({query: {col: 'ilike.*0'}})
                .should.equal('WHERE col ILIKE \'%0\'');
        });
    });

    describe('combining operators', function() {
        it('should create AND conditions', function() {
            requestToWhereClause({query: {a: 'gt.1', b: 'lt.2'}})
                .should.satisfy(s =>
                    s === 'WHERE a > \'1\' AND b < \'2\'' ||
                    s === 'WHERE b < \'2\' AND a > \'1\''
                );
        });
    });

    describe('escaping logic', function() {
        it('in column names', function() {
            requestToWhereClause({query: {A: 'gt.1', ';': 'lt.2'}})
                .should.satisfy(s =>
                    s === 'WHERE "A" > \'1\' AND ";" < \'2\'' ||
                    s === 'WHERE ";" < \'2\' AND "A" > \'1\''
                );
        });
    });

    describe('regexp mistake (unescaped dot)', function() {
        it('should not happen between op and value', function() {
            (() => requestToWhereClause({query: {col: 'eq_0'}}))
                .should.throw(/Unrecognized query condition/i);
        });
        it('should not happen between not and op', function() {
            (() => requestToWhereClause({query: {col: 'not_eq.0'}}))
                .should.throw(/Unrecognized query condition/i);
        });
    });
});
