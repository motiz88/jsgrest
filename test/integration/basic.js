import chai, {expect} from 'chai';
import createApp from '../../src/app';
import dbFixtures from '../utils/dbFixtures';

describe('App', function() {
    before(async function() {
        this.timeout(60000);
        await dbFixtures.setup();
    });

    after(async function() {
        await dbFixtures.teardown();
    });


    let app;

    it('factory (createApp) should be a function', function() {
        expect(createApp).to.exist
            .and.to.be.a('function');
    });

    describe('instance', function() {
        before(function() {
            app = createApp({connectionString: dbFixtures.connectionString, schema: 'public'});
        });

        it('should respond to HTTP requests', async function() {
            await chai.request(app)
                .get('/');
        });

        it('should respond with success to "GET /"', async function() {
            const res = await chai.request(app)
                .get('/');
            res.should.have.status(200);
        });
    });
});
