import chai, {expect} from 'chai';
import createApp from '../../src/app';
import dbFixtures from '../utils/dbFixtures';
import serverAddress from '../utils/serverAddress';
import http from 'http';
import fetch from 'node-fetch';

before(async function() {
    this.timeout(60000);
    await dbFixtures.setup();
});

after(async function() {
    await dbFixtures.teardown();
});

describe('Deleting', function() {
    let app, appServer,
        appFetch = (path, ...args) => fetch(serverAddress(appServer, path), ...args);
    before(function() {
        app = createApp({
            connectionString: dbFixtures.connectionString,
            schema: 'test'
        });
        appServer = http.createServer(app);
    });

    after(function(done) {
        appServer.close(done);
    });

    describe('existing record', function() {
        it('succeeds with 204 and deletion count', async function() {
            const res = await chai.request(app).delete('/items?id=eq.1')
            expect(res.body).to.not.exist;
            res.should.have.status(204);
            res.should.have.header('Content-Range', '*/1');
        });

        it('actually clears items ouf the db', async function() {
            await chai.request(app).delete('/items?id=lt.15');
            const res = await chai.request(app).get('/items');
            res.body.should.deep.equal([{
                id: 15
            }]);
            res.should.have.status(200);
            res.should.have.header('Content-Range', '0-0/1');
        });
    });

    describe('known route, unknown record', function() {
        it('fails with 404', async function() {
            const res = await appFetch('/items?id=eq.101', {
                method: 'DELETE'
            });
            res.should.have.property('status', 404);
        });
    });

    describe('totally unknown route', function() {
        it('fails with 404', async function() {
            const res = await appFetch('/foozle?id=eq.101', {
                method: 'DELETE'
            });
            res.should.have.property('status', 404);
        });
    });
});
