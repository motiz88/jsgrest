import chai from 'chai';
import createApp from '../../src/app';
import dbFixtures from '../utils/dbFixtures';

before(async function() {
    this.timeout(60000);
    await dbFixtures.setup();
});

after(async function() {
    await dbFixtures.teardown();
});

describe('TODO: QueryLimited', function() {
    let app;
    before(function() {
        app = createApp({
            connectionString: dbFixtures.connectionString,
            schema: 'test',
            limitRows: 3
        });
    });

    describe('TODO: Requesting many items with server limits enabled', function() {
        it('restricts results', async function() {
            const res = await chai.request(app).get('/items');
            res.should.have.status(206);
            res.body.should.deep.equal([{id: 1}, {id: 2}, {id: 3}]);
            res.should.have.header('Content-Range', '0-2/15');
        });

        it('respects additional client limiting', async function() {
            const res = await chai.request(app).get('/items')
                .set('Range', '0-1')
                .set('Range-Unit', 'items');
            res.should.have.status(206);
            res.should.have.header('Content-Range', '0-1/15');
        });
    });

});
