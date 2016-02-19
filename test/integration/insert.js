import chai, {expect} from 'chai';
import createApp from '../../src/app';
import dbFixtures from '../utils/dbFixtures';
import serverAddress from '../utils/serverAddress';
import http from 'http';
import fetch from 'node-fetch';

describe('Insert', function() {
    before(async function() {
        this.timeout(60000);
        await dbFixtures.setup();
    });

    after(async function() {
        await dbFixtures.teardown();
    });

    let appVariants, appServer,
    appFetch = (path, ...args) => fetch(serverAddress(appServer, path), ...args),
    makeFetchHelper = method => (path, body, options) => {
        const {headers, ...otherOptions} = options || {};
        return appFetch(path, {
            method,
            body: typeof body === 'string' ? body : JSON.stringify(body),
            headers: Object.assign(body ? {
                'Content-Type': 'application/json'
            } : {}, headers || {}),
            ...otherOptions
        });
    };
    const fPost = makeFetchHelper('POST'),
        fPut = makeFetchHelper('PUT'),
        fPatch = makeFetchHelper('PATCH');

    let get, post, put, patch;

    before(function() {
        appVariants = {
            main: createApp({
                connectionString: dbFixtures.connectionString,
                schema: 'test',
                pure: false,
            }),
            pure: createApp({
                connectionString: dbFixtures.connectionString,
                schema: 'test',
                pure: true,
            }),
        };
        const req = chai.request(appVariants.main);
        get = req.get.bind(req);
        post = req.post.bind(req);
        put = req.put.bind(req);
        patch = req.patch.bind(req);
        appServer = http.createServer(appVariants.main);
    });

    after(function(done) {
        appServer.close(done);
    });

    describe('Posting new record', function() {
        describe('disparate json types', function() {
            it('accepts disparate json types', async function() {
                const res = await post('/menagerie')
                    .send({
                        integer: 13,
                        double: 3.14159,
                        varchar: 'testing!',
                        boolean: false,
                        date: '1900-01-01',
                        money: '$3.99',
                        enum: 'foo'
                    });
                res.should.have.status(201);
                expect(res.text).to.be.empty;
            });

            it('filters columns in result using &select', async function() {
                const res = await post('/menagerie?select=integer,varchar')
                    .set('Prefer', 'return=representation')
                    .send({
                        integer: 14,
                        double: 3.14159,
                        varchar: 'testing!',
                        boolean: false,
                        date: '1900-01-01',
                        money: '$3.99',
                        enum: 'foo'
                    });
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.deep.equal({
                    integer: 14,
                    varchar: 'testing!'
                });
            });

            it('TODO: includes related data after insert', async function() {
                const res = await post('/projects?select=id,name,clients{id,name}')
                    .set('Prefer', 'return=representation')
                    .send({
                        id: 6,
                        name: 'New Project',
                        client_id: 2
                    });
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.deep.equal({
                    id: 6,
                    name: 'New Project',
                    clients: {
                        id: 2,
                        name: "Apple"
                    }
                });
                res.should.have.header('Location', '/projects?id=eq.6');
            });
        });
        describe('with no pk supplied', function() {
            describe('into a table with auto-incrementing pk', function() {
                describe('TODO: in non-pure mode', function () {
                    it('succeeds with 201 and link', async function() {
                        const res = await post('/auto_incrementing_pk')
                            .send({
                                non_nullable_string: 'not null'
                            });
                        res.should.have.status(201);
                        expect(res.text).to.be.empty;
                        res.should.have.header('Location', /\/auto_incrementing_pk\?id=eq\.[0-9]+/);
                        const res2 = await get(res.get('Location'));
                        res2.should.be.json;
                        res2.body.should.be.an('array')
                            .with.length(1);
                        res2.body[0].should.have.property('id');
                        res2.body[0].should.have.property('nullable_string', null);
                        res2.body[0].should.have.property('non_nullable_string', 'not null');
                    });
                });
                describe('in pure mode', function () {
                    it('succeeds with 201', async function() {
                        const res = await chai.request(appVariants.pure)
                            .post('/auto_incrementing_pk')
                            .send({
                                non_nullable_string: 'not null'
                            });
                        res.should.have.status(201);
                        expect(res.text).to.be.empty;
                    });
                });
            });
            describe('into a table with auto-incrementing pk', function() {
                describe('TODO: in non-pure mode', function () {
                    it('succeeds with 201 and link', async function() {
                        const res = await post('/auto_incrementing_pk')
                            .send({
                                non_nullable_string: 'not null'
                            });
                        res.should.have.status(201);
                        expect(res.text).to.be.empty;
                        res.should.have.header('Location', /\/auto_incrementing_pk\?id=eq\.[0-9]+/);
                        const res2 = await get(res.get('Location'));
                        res2.should.be.json;
                        res2.body.should.be.an('array')
                            .with.length(1);
                        res2.body[0].should.have.property('id');
                        res2.body[0].should.have.property('nullable_string', null);
                        res2.body[0].should.have.property('non_nullable_string', 'not null');
                    });
                });
                describe('in pure mode', function () {
                    it('succeeds with 201', async function() {
                        const res = await chai.request(appVariants.pure)
                            .post('/auto_incrementing_pk')
                            .send({
                                non_nullable_string: 'not null'
                            });
                        res.should.have.status(201);
                        expect(res.text).to.be.empty;
                    });
                });
            });
            describe('into a table with simple pk', function() {
                it('fails with 400 and error', async function() {
                    const res = await fPost('/simple_pk', {extra: 'foo'});
                    res.should.have.property('status', 400);
                });
            });
            describe('into a table with no pk', function() {
                describe('TODO: in non-pure mode', function () {
                    it('succeeds with 201 and a link including all fields', async function() {
                        const res = await post('/no_pk')
                            .send({a: 'foo', b: 'bar'});
                        expect(res.text).to.be.empty;
                        res.should.have.header('Location', /\/no_pk\?a=eq.foo&b=eq.bar/);
                        res.should.have.status(201);
                    });
                    it('returns full details of inserted record if asked', async function() {
                        const res = await post('/no_pk')
                            .set('Prefer', 'return=representation')
                            .send({a: 'bar', b: 'baz'});
                        res.body.should.deep.equal({a: 'bar', b: 'baz'});
                        res.should.have.header('Location', /\/no_pk\?a=eq.bar&b=eq.baz/);
                        res.should.have.status(201);
                    });
                    it('can post nulls', async function() {
                        const res = await post('/no_pk')
                            .set('Prefer', 'return=representation')
                            .send({a: null, b: 'foo'});
                        res.body.should.deep.equal({a: null, b: 'foo'});
                        res.should.have.header('Location', /\/no_pk\?a=is.null&b=eq.foo/);
                        res.should.have.status(201);
                    });
                });
                describe('in pure mode', function () {
                    it('succeeds with 201', async function() {
                        const res = await chai.request(appVariants.pure)
                            .post('/no_pk')
                            .send({a: 'foo', b: 'bar'});
                        expect(res.text).to.be.empty;
                        res.should.have.status(201);
                    });
                    it('returns full details of inserted record if asked', async function() {
                        const res = await chai.request(appVariants.pure)
                            .post('/no_pk')
                            .set('Prefer', 'return=representation')
                            .send({a: 'bar', b: 'baz'});
                        res.body.should.deep.equal({a: 'bar', b: 'baz'});
                        res.should.have.status(201);
                    });
                    it('can post nulls', async function() {
                        const res = await chai.request(appVariants.pure)
                            .post('/no_pk')
                            .set('Prefer', 'return=representation')
                            .send({a: null, b: 'foo'});
                        res.body.should.deep.equal({a: null, b: 'foo'});
                        res.should.have.status(201);
                    });
                });
                it('can insert in tables with no select privileges', async function() {
                    const res = await post('/insertonly')
                        .set('Prefer', 'return=minimal')
                        .send({v: 'some value' });
                    expect(res.text).to.be.empty;
                    res.should.have.status(201);
                });
            });
        });

        describe('with compound pk supplied', function() {
            describe('in pure mode', function () {
                it('succeeds with 201', async function() {
                    const res = await chai.request(appVariants.pure)
                        .post('/compound_pk')
                        .send({k1: 12, k2: 42});
                    expect(res.text).to.be.empty;
                    res.should.have.status(201);
                });
            });
            describe('TODO: in non-pure mode', function () {
                it('builds response location header appropriately', async function() {
                    const res = await post('/compound_pk')
                        .send({k1: 12, k2: 42});
                    expect(res.text).to.be.empty;
                    res.should.have.status(201);
                    res.should.have.header('Location', '/compound_pk?k1=eq.12&k2=eq.42');
                });
            });
        });
        describe('with invalid json payload', function() {
            it('fails with 400 and error', async function() {
                const res = await fPost('/simple_pk', '}{ x = 2', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                res.should.have.status(400);
            });
        });
        describe('with valid json payload', function() {
            it('succeeds and returns 201 created', async function() {
                const res = await post('/simple_pk')
                    .send({k: 'k1', extra: 'e1'});
                res.should.have.status(201);
            });
        });
        describe('attempting to insert a row with the same primary key', function() {
            it('fails returning a 409 Conflict', async function() {
                const res = await fPost('/simple_pk', {
                    k: 'k1', extra: 'e1'
                });
                res.should.have.status(409);
            });
        });
        describe('attempting to insert a row with conflicting unique constraint', function() {
            it('fails returning a 409 Conflict', async function() {
                const res = await fPost('/withUnique', {
                    uni: 'nodup',
                    extra: 'e2'
                });
                res.should.have.status(409);
            });
        });
        describe('jsonb', function() {
            describe('TODO: in non-pure mode', function() {
                it('serializes nested object', async function() {
                    const inserted = {
                        data: {
                            foo: 'bar'
                        }
                    };
                    const res = await post('/json')
                        .set('Prefer', 'return=representation')
                        .send(inserted);
                    res.body.should.deep.equal(inserted);
                    res.should.have.status(201);
                    res.should.have.header('Location', '/json?data=eq.{"foo":"bar"}')
                });
                it('serializes nested array', async function() {
                    const inserted = {
                        data: [1, 2, 3]
                    };
                    const res = await post('/json')
                        .set('Prefer', 'return=representation')
                        .send(inserted);
                    res.body.should.deep.equal(inserted);
                    res.should.have.status(201);
                    res.should.have.header('Location', '/json?data=eq.[1,2,3]');
                });
            });
            describe('in pure mode', function() {
                it('serializes nested object', async function() {
                    const inserted = {
                        data: {
                            foo: 'bar'
                        }
                    };
                    const res = await chai.request(appVariants.pure)
                        .post('/json')
                        .set('Prefer', 'return=representation')
                        .send(inserted);
                    res.body.should.deep.equal(inserted);
                    res.should.have.status(201);
                });
                it('serializes nested array', async function() {
                    const inserted = {
                        data: [1, 2, 3]
                    };
                    const res = await chai.request(appVariants.pure)
                        .post('/json')
                        .set('Prefer', 'return=representation')
                        .send(inserted);
                    res.body.should.deep.equal(inserted);
                    res.should.have.status(201);
                });
            });
        });
        describe('mixing json and arrays', function() {
            it('serializes json array', async function() {
                const inserted = {
                    json_data: [1, 2, '3']
                };
                const res = await post('/array_vs_json?select=json_data')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
            it('serializes json nested array', async function() {
                const inserted = {
                    json_data:
                        [1, [2, '3'], 4, '5', {a: '6', b: {c: 7, d: '8'}, e: [], f: [9, '10']}]
                };
                const res = await post('/array_vs_json?select=json_data')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
            it('TODO: serializes json[]', async function() {
                const inserted = {
                    jsons:
                        [[1, [2, '3'], 4, '5', {a: '6', b: {c: 7, d: '8'}, e: [], f: [9, '10']}]]
                };
                const res = await post('/array_vs_json?select=jsons')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
            it('serializes jsonb array', async function() {
                const inserted = {
                    jsonb_data: [1, 2, '3']
                };
                const res = await post('/array_vs_json?select=jsonb_data')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
            it('serializes jsonb nested array', async function() {
                const inserted = {
                    jsonb_data:
                        [1, [2, '3'], 4, '5', {a: '6', b: {c: 7, d: '8'}, e: [], f: [9, '10']}]
                };
                const res = await post('/array_vs_json?select=jsonb_data')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
            it('TODO: serializes jsonb[]', async function() {
                const inserted = {
                    jsonbs:
                        [[1, [2, '3'], 4, '5', {a: '6', b: {c: 7, d: '8'}, e: [], f: [9, '10']}]]
                };
                const res = await post('/array_vs_json?select=jsonbs')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
            it('TODO: serializes int[]', async function() {
                const inserted = {
                    ints: [1, 2, 3]
                };
                const res = await post('/array_vs_json?select=ints')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
            it('TODO: serializes text[]', async function() {
                const inserted = {
                    texts: ['1', '2', '3']
                };
                const res = await post('/array_vs_json?select=texts')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.deep.equal(inserted);
                res.should.have.status(201);
            });
        });
    });
    describe('TODO: CSV insert', function() {
        describe('disparate csv types', function() {
            it('succeeds with multipart response', async function() {
                const inserted = [
                    'integer,double,varchar,boolean,date,money,enum',
                    '13,3.14159,testing!,false,1900-01-01,$3.99,foo',
                    '12,0.1,a string,true,1929-10-01,12,bar'
                ].join('\n');

                const res = await post('/menagerie')
                    .accept('csv')
                    .type('csv')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.equal(inserted);
                res.should.have.status(201);
                res.should.have.header('Content-Type', 'text/csv');
            });
        });
        describe('requesting full representation', function() {
            it('returns full details of inserted record', async function() {
                const inserted = 'a,b\nbar,baz';
                const res = await post('/no_pk')
                    .accept('csv')
                    .type('csv')
                    .set('Prefer', 'return=representation')
                    .send(inserted);
                res.body.should.equal(inserted);
                res.should.have.status(201);
                res.should.have.header('Content-Type', 'text/csv');
                res.should.have.header('Location', '/no_pk?a=eq.bar&b=eq.baz');
            });
            it('can post nulls', async function() {
                const res = await post('/no_pk')
                    .accept('csv')
                    .type('csv')
                    .set('Prefer', 'return=representation')
                    .send('a,b\nNULL,foo');
                res.body.should.equal('a,b\n,foo');
                res.should.have.status(201);
                res.should.have.header('Content-Type', 'text/csv');
                res.should.have.header('Location', '/no_pk?a=is.null&b=eq.foo');
            });
        });
        describe('with wrong number of columns', function() {
            it('fails for too few', async function() {
                const res = await fPost('/no_pk', 'a,b\nfoo,bar\nbaz', {
                    headers: {'Content-Type': 'text/csv'}
                });
                res.should.have.property('status', 400);
            });
        });
    });

    describe('DEPRECATED: Putting record', function() {
        describe('to unknown uri', function() {
            it('gives a 404', async function() {
                const res = await fPut('/fake', {real: false});
                res.should.have.property('status', 404);
            });
        });
        describe('to a known uri', function() {
            describe('without a fully-specified primary key', function() {
                it('is not an allowed operation', async function() {
                    const res = await fPut('/compound_pk?k1=eq.12', {
                        k1: 12,
                        k2: 42
                    });
                    res.should.have.property('status', 405);
                });
            });
            describe('with a fully-specified primary key', function() {
                describe('not specifying every column in the table', function() {
                    it('is rejected for lack of idempotence', async function() {
                        const res = await fPut('/compound_pk?k1=eq.12&k2=eq.42', {
                            k1: 12,
                            k2: 42
                        });
                        res.should.have.property('status', 400);
                    });
                });
                describe('specifying every column in the table', function() {
                    it('can create a new record', async function() {
                        const res = await put('/compound_pk?k1=eq.12&k2=eq.42')
                            .send({
                                k1: 12,
                                k2: 42,
                                extra: 3
                            });
                        expect(res.text).to.be.empty;
                        res.should.have.status(204);

                        const res2 = await get('/compound_pk?k1=eq.12&k2=eq.42');
                        res2.body.should.deep.equal([{
                            k1: 12,
                            k2: 42,
                            extra: 3
                        }]);
                    });
                    it('can update an existing record', async function() {
                        await put('/compound_pk?k1=eq.12&k2=eq.42')
                            .send({
                                k1: 12,
                                k2: 42,
                                extra: 4
                            });
                        await put('/compound_pk?k1=eq.12&k2=eq.42')
                            .send({
                                k1: 12,
                                k2: 42,
                                extra: 5
                            });

                        const res = await get('/compound_pk?k1=eq.12&k2=eq.42');
                        res.should.deep.equal([{k1: 12, k2: 42, extra: 5}]);
                    });
                });
            });
            describe('with an auto-incrementing primary key', function() {
                it('succeeds with 204', async function() {
                    const res = await put('/auto_incrementing_pk?id=eq.1')
                        .send({
                            id: 1,
                            nullable_string: "hi",
                            non_nullable_string: "bye",
                            inserted_at: "2020-11-11"
                        });
                    res.should.have.status(204);
                });
            });
        });
    });
    describe('Patching record', function() {
        describe('to unknown uri', function() {
            it('gives a 404', () =>
                fPatch('/fake', {real: false})
                    .should.eventually.have.status(404)
            );
        });
        describe('on an empty table', function() {
            it('indicates no records found to update', () =>
                fPatch('/empty_table', {extra: 20})
                    .should.eventually.have.status(404)
            );
        });
        describe('in a nonempty table', function() {
            it('can update a single item', async function() {
                const g = await get('/items?id=eq.42');
                g.should.have.header('Content-Range', '*/0');
                const res = await patch('/items?id=eq.2')
                    .send({id: 42});
                res.should.have.status(204);
                expect(res.text).to.be.empty;
                res.should.have.header('Content-Range', '0-0/1');
                const g2 = await get('/items?id=eq.42');
                g2.should.have.header('Content-Range', '0-0/1');
            });
            it('can update multiple items', async function() {
                let posts = [];
                for (let i = 0; i < 10; ++i) {
                    ['a', 'b'].forEach(x =>
                        posts.push(post('/auto_incrementing_pk').send({non_nullable_string: x}))
                    );
                }
                await Promise.all(posts);
                await patch('/auto_incrementing_pk?non_nullable_string=eq.a')
                    .send({non_nullable_string: 'c'});
                const res = await get('/auto_incrementing_pk?non_nullable_string=eq.c');
                res.should.have.header('Content-Range', '0-9/10');
            });
            it('can set a column to NULL', async function() {
                await post('/no_pk').send({a: 'keepme', b: 'nullme'});
                await patch('/no_pk?b=eq.nullme').send({b: null});
                const res = await get('/no_pk?a=eq.keepme')
                res.body.should.deep.equal([{a: 'keepme', b: null}]);
            });
            it('TODO: can update based on a computed column', () =>
                patch('/items?always_true=eq.false')
                .set('Prefer', 'return=representation')
                .send({id: 100})
                .should.eventually.have.status(404)
            );
            it('can provide a representation', async function() {
                await post('/items')
                    .send({id: 100});
                const res = await patch('/items?id=eq.100')
                    .set('Prefer', 'return=representation')
                    .send({id: 99});
                res.body.should.deep.equal([{id:99}]);
            });
            it('can set a json column to escaped value', async function() {
                await post('/json')
                    .send({data: {escaped: 'bar'}});
                const res = await patch('/json?data->>escaped=eq.bar')
                    .set('Prefer', 'return=representation')
                    .send({data: {escaped: ' "bar'}});
                res.should.have.status(200);
                res.body.should.deep.equal([{data: {escaped: ' "bar'}}]);
            });
        });
    });
    describe('TODO: Row level permission', function() {
        it('set user_id when inserting rows', async function() {
            const authTokens = {jdoe: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
                            + '.eyJyb2xlIjoicG9zdGdyZXN0X3Rlc3RfYXV0aG9yIiwiaWQiOiJqZG9lIn0'
                            + '.y4vZuu1dDdwAl0-S00MCRWRYMlJ5YAMSir6Es6WtWx0',
                            jroe: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
                            + '.eyJyb2xlIjoicG9zdGdyZXN0X3Rlc3RfYXV0aG9yIiwiaWQiOiJqcm9lIn0'
                            + '.YuF_VfmyIxWyuceT7crnNKEprIYXsJAyXid3rjPjIow'};

            await post('/postgrest/users').send({
                id: 'jdoe',
                pass: '1234',
                role: 'postgrest_test_author'
            });
            await post('/postgrest/users').send({
                id: 'jroe',
                pass: '1234',
                role: 'postgrest_test_author'
            });
            const res1 = await post('/authors_only')
                .set('Authorization', 'Bearer ' + authTokens.jdoe)
                .set('Prefer', 'return=representation')
                .send({secret: 'nyancat'});
            res1.body.should.deep.equal({owner: 'jdoe', secret: 'nyancat'});
            res1.should.have.status(201);

            const res2 = await post('/authors_only')
                .set('Authorization', 'Bearer ' + authTokens.jroe)
                .set('Prefer', 'return=representation')
                .send({secret: 'lolcat', owner: 'hacker'});
            res2.body.should.deep.equal({owner: 'jroe', secret: 'lolcat'});
            res2.should.have.status(201);
        });
    });
});
