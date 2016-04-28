import requestToInvokeStatement from '../../src/query/requestToInvokeStatement';
import {isFragment as isSqlFragment} from '../../src/sqlTemplate';

import {expect} from 'chai';

describe('requestToInvokeStatement', function() {
    it('should be a function', function() {
        expect(requestToInvokeStatement).to.exist
            .and.to.be.a('function');
    });

    it('sanity check', function() {
        const stmt = requestToInvokeStatement({
            flags: {},
            range: {
                unit: 'items',
                first: 0,
                last: 1
            },
            body: {
                arg1: '0'
            },
            dbConfig: {
                schema: 'public'
            },
            params: {
                relation: 'aFunction'
            }
        });
        stmt.should.satisfy(isSqlFragment);
        stmt.text.should.match(/SELECT/i);
        stmt.text.should.match(/"aFunction"\s*\(/);
        stmt.text.should.match(/arg1"?\s*:=/);
        stmt.values.should.be.an('array');
    });
});
