import formatContentRange from '../../src/formatContentRange';
import {expect} from 'chai';

describe('formatContentRange', function() {
    it('should be a function', function() {
        expect(formatContentRange).to.exist
            .and.to.be.a('function');
    });

    it('should throw if passed null', function() {
        expect(() => formatContentRange(null)).to.throw;
        expect(() => formatContentRange(false)).to.throw;
        expect(() => formatContentRange('')).to.throw;
    });

    it('should throw if missing first', function() {
        expect(() => formatContentRange({last: 0, length: 1})).to.throw;
    });

    it('should throw if missing last', function() {
        expect(() => formatContentRange({first: 0, length: 1})).to.throw;
    });

    it('should format a simple bounded range', function() {
        formatContentRange({first: 0, last: 1, length: 5}).should.equal('0-1/5');
    });

    it('should format nonnumeric length as *', function() {
        formatContentRange({first: 0, last: 1, length: null}).should.equal('0-1/*');
        formatContentRange({first: 0, last: 1, length: '*'}).should.equal('0-1/*');
    });

    it('should format singleton range correctly', function() {
        formatContentRange({first: 5, last: 5, length: 10}).should.equal('5-5/10');
    });
});
