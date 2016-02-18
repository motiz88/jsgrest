import requestToCreateStatement from '../../src/query/requestToCreateStatement';
import {isFragment as isSqlFragment} from '../../src/sqlTemplate';

import {expect} from 'chai';

describe('requestToCreateStatement', function() {
    it('should be a function', function() {
        expect(requestToCreateStatement).to.exist
            .and.to.be.a('function');
    });

    it('sanity check', function() {
        const stmt = requestToCreateStatement({
            flags: {},
            dbConfig: {
                schema: 'public'
            },
            params: {
                relation: 'aTable'
            },
            body: {
                col: '123'
            }
        });
        stmt.should.satisfy(isSqlFragment);
        stmt.text.should.match(/INSERT/i);
        stmt.values.should.be.an('array');
    });
});
