import requestToWhereClause from '../../src/query/requestToWhereClause';
import {expect} from 'chai';
import {isFragment as isSqlFragment} from '../../src/sqlTemplate';

describe('requestToWhereClause', function() {
    it('should be a function', function() {
        expect(requestToWhereClause).to.exist
            .and.to.be.a('function');
    });

    it('should return an SQL Fragment', function() {
        requestToWhereClause({})
            .should.satisfy(isSqlFragment);
    });

    it('should return empty string if filter unspecified', function() {
        requestToWhereClause({})
            .text.should.equal('');
        requestToWhereClause({query: {}})
            .text.should.equal('');
        requestToWhereClause({query: {order: ''}})
            .text.should.equal('');
        requestToWhereClause({query: {select: ''}})
            .text.should.equal('');
        requestToWhereClause({query: {select: '', order: ''}})
            .text.should.equal('');
    });

    describe('operator eq', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'eq.0'}})
                .text.should.equal('WHERE col = $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.eq.0'}})
                .text.should.equal('WHERE NOT (col = $1)');
        });
    });

    describe('operator neq', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'neq.0'}})
                .text.should.equal('WHERE col <> $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.neq.0'}})
                .text.should.equal('WHERE NOT (col <> $1)');
        });
    });

    describe('operator gt', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'gt.0'}})
                .text.should.equal('WHERE col > $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.gt.0'}})
                .text.should.equal('WHERE NOT (col > $1)');
        });
    });

    describe('operator lt', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'lt.0'}})
                .text.should.equal('WHERE col < $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.lt.0'}})
                .text.should.equal('WHERE NOT (col < $1)');
        });
    });

    describe('operator gte', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'gte.0'}})
                .text.should.equal('WHERE col >= $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.gte.0'}})
                .text.should.equal('WHERE NOT (col >= $1)');
        });
    });

    describe('operator lte', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'lte.0'}})
                .text.should.equal('WHERE col <= $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.lte.0'}})
                .text.should.equal('WHERE NOT (col <= $1)');
        });
    });

    describe('operator <@', function() {
        it('should be recognized with array literal', function() {
            const r = requestToWhereClause({query: {col: '<@.{0}'}});
            r.text.should.equal('WHERE col <@ $1');
            r.values.should.deep.equal([['0']]);
        });
        it('should be recognized with array literal in the negative', function() {
            const r = requestToWhereClause({query: {col: 'not.<@.{0}'}});
            r.text.should.equal('WHERE NOT (col <@ $1)');
            r.values.should.deep.equal([['0']]);
        });
    });

    describe('operator @>', function() {
        it('should be recognized with array literal', function() {
            const r = requestToWhereClause({query: {col: '@>.{0}'}});
            r.should.satisfy(isSqlFragment);
            r.text.should.equal('WHERE col @> $1');
            r.values.should.deep.equal([['0']]);
        });
        it('should be recognized with array literal in the negative', function() {
            const r = requestToWhereClause({query: {col: 'not.@>.{0}'}});
            r.should.satisfy(isSqlFragment);
            r.text.should.equal('WHERE NOT (col @> $1)');
            r.values.should.deep.equal([['0']]);
        });
    });

    describe('operator is', function() {
        it('should be recognized with NULL', function() {
            requestToWhereClause({query: {col: 'is.null'}})
                .text.should.equal('WHERE col IS NULL');
        });
        it('should be recognized with NULL in the negative', function() {
            requestToWhereClause({query: {col: 'not.is.null'}})
                .text.should.equal('WHERE NOT (col IS NULL)');
        });
        it('should be recognized with TRUE', function() {
            requestToWhereClause({query: {col: 'is.true'}})
                .text.should.equal('WHERE col IS TRUE');
        });
        it('should be recognized with FALSE', function() {
            requestToWhereClause({query: {col: 'is.false'}})
                .text.should.equal('WHERE col IS FALSE');
        });
        it('should escape any other string', function() {
            requestToWhereClause({query: {col: 'is.drop'}})
                .text.should.equal('WHERE col IS $1');
        });
    });

    describe('operator isnot', function() {
        it('should be recognized with NULL', function() {
            requestToWhereClause({query: {col: 'isnot.null'}})
                .text.should.equal('WHERE col IS NOT NULL');
        });
        it('should be recognized with NULL in the negative', function() {
            requestToWhereClause({query: {col: 'not.isnot.null'}})
                .text.should.equal('WHERE NOT (col IS NOT NULL)');
        });
        it('should be recognized with TRUE', function() {
            requestToWhereClause({query: {col: 'isnot.true'}})
                .text.should.equal('WHERE col IS NOT TRUE');
        });
        it('should be recognized with FALSE', function() {
            requestToWhereClause({query: {col: 'isnot.false'}})
                .text.should.equal('WHERE col IS NOT FALSE');
        });
        it('should escape any other string', function() {
            requestToWhereClause({query: {col: 'isnot.drop'}})
                .text.should.equal('WHERE col IS NOT $1');
        });
    });

    describe('operator in', function() {
        it('should be recognized with a list', function() {
            requestToWhereClause({query: {col: 'in.0,1,2'}})
                .text.should.equal('WHERE col IN ($1,$2,$3)');
        });
        it('should be recognized with a list in the negative', function() {
            requestToWhereClause({query: {col: 'not.in.0,1,2'}})
                .text.should.equal('WHERE NOT (col IN ($1,$2,$3))');
        });
    });

    describe('operator notin', function() {
        it('should be recognized with a list', function() {
            requestToWhereClause({query: {col: 'notin.0,1,2'}})
                .text.should.equal('WHERE col NOT IN ($1,$2,$3)');
        });
        it('should be recognized with a list in the negative', function() {
            requestToWhereClause({query: {col: 'not.notin.0,1,2'}})
                .text.should.equal('WHERE NOT (col NOT IN ($1,$2,$3))');
        });
    });

    describe('operator @@', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: '@@.0'}})
                .text.should.equal('WHERE col @@ to_tsquery($1)');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.@@.0'}})
                .text.should.equal('WHERE NOT (col @@ to_tsquery($1))');
        });
    });

    describe('operator like', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'like.0'}})
                .text.should.equal('WHERE col LIKE $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.like.0'}})
                .text.should.equal('WHERE NOT (col LIKE $1)');
        });
        it('should translate wildcards', function() {
            const r1 = requestToWhereClause({query: {col: 'like.0*'}});
            r1.text.should.equal('WHERE col LIKE $1');
            r1.values.should.deep.equal(['0%']);

            const r2 = requestToWhereClause({query: {col: 'like.0*1*'}});
            r2.text.should.equal('WHERE col LIKE $1');
            r2.values.should.deep.equal(['0%1%']);

            const r3 = requestToWhereClause({query: {col: 'like.*0'}});
            r3.text.should.equal('WHERE col LIKE $1');
            r3.values.should.deep.equal(['%0']);
        });
    });

    describe('operator ilike', function() {
        it('should be recognized', function() {
            requestToWhereClause({query: {col: 'ilike.0'}})
                .text.should.equal('WHERE col ILIKE $1');
        });
        it('should be recognized in the negative', function() {
            requestToWhereClause({query: {col: 'not.ilike.0'}})
                .text.should.equal('WHERE NOT (col ILIKE $1)');
        });
        it('should translate wildcards', function() {
            const r1 = requestToWhereClause({query: {col: 'ilike.0*'}});
            r1.text.should.equal('WHERE col ILIKE $1');
            r1.values.should.deep.equal(['0%']);

            const r2 = requestToWhereClause({query: {col: 'ilike.0*1*'}});
            r2.text.should.equal('WHERE col ILIKE $1');
            r2.values.should.deep.equal(['0%1%']);

            const r3 = requestToWhereClause({query: {col: 'ilike.*0'}});
            r3.text.should.equal('WHERE col ILIKE $1');
            r3.values.should.deep.equal(['%0'])
        });
    });

    describe('combining operators', function() {
        it('should create AND conditions', function() {
            const r = requestToWhereClause({query: {a: 'gt.1', b: 'lt.2'}});
            r.text.should.satisfy(s =>
                s === 'WHERE a > $1 AND b < $2' ||
                s === 'WHERE b < $1 AND a > $2'
            );
            r.values.should.include.something.that.equals('1');
            r.values.should.include.something.that.equals('2');
        });
    });

    describe('escaping logic', function() {
        it('in column names', function() {
            requestToWhereClause({query: {A: 'gt.1', ';': 'lt.2'}})
                .text.should.satisfy(s =>
                    s === 'WHERE "A" > $1 AND ";" < $2' ||
                    s === 'WHERE ";" < $1 AND "A" > $2'
                );
        });
    });

    describe('dereferencing JSON on left-hand side', function() {
        it(`col->>'a'`, function() {
            requestToWhereClause({query: {'col->>a': 'eq.0'}})
                .text.should.equal(`WHERE col->>'a' = $1`);
        });

        it(`col->'a'->>'b'`, function() {
            requestToWhereClause({query: {'col->a->>b': 'eq.0'}})
                .text.should.equal(`WHERE col->'a'->>'b' = $1`);
        });

        it(`"Col"->'a'->>'b'`, function() {
            requestToWhereClause({query: {'Col->a->>b': 'eq.0'}})
                .text.should.equal(`WHERE "Col"->'a'->>'b' = $1`);
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
