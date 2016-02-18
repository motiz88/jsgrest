import sqlTemplate, {isFragment, join, raw} from '../../src/sqlTemplate';
import {expect} from 'chai';

describe('sqlTemplate', function() {
    it('should be a function', function() {
        expect(sqlTemplate).to.exist
            .and.to.be.a('function');
    });

    describe('#isFragment', function() {
        it('should be a function', function() {
            expect(isFragment).to.exist
                .and.to.be.a('function');
        });
    });

    describe('#join', function() {
        it('should be a function', function() {
            expect(join).to.exist
                .and.to.be.a('function');
        });
        it('should return a fragment from an array', function() {
            join([]).should.satisfy(isFragment);
        });
        it('should return an empty fragment from an empty array', function() {
            join([]).text.should.be.empty;
            join([]).values.should.be.empty;
        });
        it('separator should default to \',\'' , function() {
            const objval = {a: 'b'};

            const frag = join(['a', 'b']);
            frag.should.satisfy(isFragment);
            frag.text.should.equal('$1,$2');
            frag.values.should.deep.equal(['a', 'b']);
        });
        it('should correctly join a single value', function() {
            const frag = join([500], ', ');
            frag.should.satisfy(isFragment);
            frag.text.should.equal('$1');
            frag.values.should.deep.equal([500]);
        });
        it('should correctly join values', function() {
            const objval = {a: 'b'};

            const frag = join([500, 1.1, objval, objval], ', ');
            frag.should.satisfy(isFragment);
            frag.text.should.equal('$1, $2, $3, $4');
            const values = frag.values;
            values.should.deep.equal([500, 1.1, objval, objval]);
            values[2].should.equal(objval);
            values[3].should.equal(objval);
        });
        it('should correctly join a single array value', function() {
            const frag = join([[500]], ', ');
            frag.should.satisfy(isFragment);
            frag.text.should.equal('$1');
            frag.values.should.deep.equal([[500]]);
        });
    });

    describe('#raw', function() {
        it('should be a function', function() {
            expect(raw).to.exist
                .and.to.be.a('function');
        });
        describe('with string argument', function() {
            it('should return a fragment from a string', function() {
                raw('').should.satisfy(isFragment);
            });
            it('should return an empty fragment from an empty string', function() {
                raw('').text.should.be.empty;
                raw('').values.should.be.empty;
            });
        });
        describe('as tag', function() {
            it('should work for a plain string', function() {
                const frag = sqlTemplate `SELECT * FROM "heyHeyHey"`;
                frag.should.satisfy(isFragment);
                frag.text.should.equal('SELECT * FROM "heyHeyHey"');
                frag.values.should.deep.equal([]);
            });

            it('should work with substitutions', function() {
                const frag = raw `SELECT * FROM "heyHeyHey" WHERE "Col" = ${500} AND OtherCol >= ${1.1}`;
                frag.should.satisfy(isFragment);
                frag.text.should.equal('SELECT * FROM "heyHeyHey" WHERE "Col" = 500 AND OtherCol >= 1.1');
                frag.values.should.be.empty;
            });

            it('should work with an embedded fragment', function() {
                const objval = {a: 'b'};

                const moreConditions = sqlTemplate `OtherCol >= ${1.1} AND ${objval} LIKE ${objval}`;
                const frag = raw `SELECT * FROM "heyHeyHey" WHERE "Col" = ${500} AND ${moreConditions}`;
                frag.should.satisfy(isFragment);
                frag.text.should.equal('SELECT * FROM "heyHeyHey" WHERE "Col" = 500 AND OtherCol >= $1 AND $2 LIKE $3');
                const values = frag.values;
                values.should.deep.equal([1.1, objval, objval]);
                values[1].should.equal(objval);
                values[2].should.equal(objval);
            });
        });
    });

    describe('as tag', function() {
        it('should work for a plain string', function() {
            const frag = sqlTemplate `SELECT * FROM "heyHeyHey"`;
            frag.should.satisfy(isFragment);
            frag.text.should.equal('SELECT * FROM "heyHeyHey"');
            frag.values.should.deep.equal([]);
        });

        it('should work with a single parameter', function() {
            const frag = sqlTemplate `SELECT * FROM "heyHeyHey" WHERE "Col" = ${500}`;
            frag.should.satisfy(isFragment);
            frag.text.should.equal('SELECT * FROM "heyHeyHey" WHERE "Col" = $1');
            frag.values.should.deep.equal([500]);
        });

        it('should work with one level of parameters', function() {
            const objval = {a: 'b'};

            const frag = sqlTemplate `SELECT * FROM "heyHeyHey" WHERE "Col" = ${500} AND OtherCol >= ${1.1} AND ${objval} LIKE ${objval}`;
            frag.should.satisfy(isFragment);
            frag.text.should.equal('SELECT * FROM "heyHeyHey" WHERE "Col" = $1 AND OtherCol >= $2 AND $3 LIKE $4');
            const values = frag.values;
            values.should.deep.equal([500, 1.1, objval, objval]);
            values[2].should.equal(objval);
            values[3].should.equal(objval);
        });

        it('should work with two levels of parameters', function() {
            const objval = {a: 'b'};

            const moreConditions = sqlTemplate `OtherCol >= ${1.1} AND ${objval} LIKE ${objval}`;
            const frag = sqlTemplate `SELECT * FROM "heyHeyHey" WHERE "Col" = ${500} AND ${moreConditions}`;
            frag.should.satisfy(isFragment);
            frag.text.should.equal('SELECT * FROM "heyHeyHey" WHERE "Col" = $1 AND OtherCol >= $2 AND $3 LIKE $4');
            const values = frag.values;
            values.should.deep.equal([500, 1.1, objval, objval]);
            values[2].should.equal(objval);
            values[3].should.equal(objval);
        });

        it('should work with an array parameter', function() {
            const frag = sqlTemplate `SELECT * FROM "heyHeyHey" WHERE "Col" = ${[500]}`;
            frag.should.satisfy(isFragment);
            frag.text.should.equal('SELECT * FROM "heyHeyHey" WHERE "Col" = $1');
            frag.values.should.deep.equal([[500]]);
        });
    });
});
