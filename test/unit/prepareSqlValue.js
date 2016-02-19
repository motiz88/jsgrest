import prepareSqlValue from '../../src/prepareSqlValue';
import {expect} from 'chai';

describe('prepareSqlValue', function() {
    it('should be defined', function() {
        prepareSqlValue.should.exist;
        prepareSqlValue.should.be.a('function');
    });
    describe('pass through', function() {
        it('null', function() {
            expect(prepareSqlValue(null)).to.equal(null);
        });
        it('undefined', function() {
            expect(prepareSqlValue(undefined)).to.equal(undefined);
        });
        it('number', function() {
            prepareSqlValue(-10).should.equal(-10);
            prepareSqlValue(0).should.equal(0);
            prepareSqlValue(0.5).should.equal(0.5);
            prepareSqlValue(1).should.equal(1);
        });
        it('string', function() {
            prepareSqlValue('').should.equal('');
            prepareSqlValue('{123}').should.equal('{123}');
            prepareSqlValue('[123]').should.equal('[123]');
        });
        it('object', function() {
            prepareSqlValue({}).should.deep.equal({});
            prepareSqlValue({a: '1'}).should.deep.equal({a: '1'});
            prepareSqlValue({a: ['1']}).should.deep.equal({a: ['1']});
        });
        it('boolean', function() {
            prepareSqlValue(true).should.equal(true);
            prepareSqlValue(false).should.equal(false);
        });
    });
    describe('JSON stringify', function() {
        it('array', function() {
            prepareSqlValue([]).should.equal(JSON.stringify([]));
            prepareSqlValue([1]).should.equal(JSON.stringify([1]));
            prepareSqlValue([[1]]).should.equal(JSON.stringify([[1]]));
            prepareSqlValue([['1']]).should.equal(JSON.stringify([['1']]));
            prepareSqlValue([['1', {a: '2'}]]).should.equal(JSON.stringify([['1', {a: '2'}]]));
        });
    });
});
