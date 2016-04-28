import chai from 'chai';
import fetch from 'node-fetch';
import createApp from '../../src/app';
import dbFixtures from '../utils/dbFixtures';
import serverAddress from '../utils/serverAddress';
import http from 'http';

describe('Query', function() {
    before(async function() {
        this.timeout(60000);
        await dbFixtures.setup();
    });

    after(async function() {
        await dbFixtures.teardown();
    });

    let app, appServer,
        appFetch = (path, ...args) => fetch(serverAddress(appServer, path), ...args);

    const makeFetchHelper = method => (path, body, options) => {
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
        fPatch = makeFetchHelper('PATCH'),
        fDelete = makeFetchHelper('DELETE'),
        fOptions = makeFetchHelper('OPTIONS');

    let req, get, post, put, patch;

    before(function() {
        app = createApp({
            connectionString: dbFixtures.connectionString,
            schema: 'test'
        });
        const req = chai.request(app);
        get = req.get.bind(req);
        post = req.post.bind(req);
        put = req.put.bind(req);
        patch = req.patch.bind(req);

        appServer = http.createServer(app);
    });

    after(function(done) {
        appServer.close(done);
    });

    describe('Querying a table with a column called count', function() {
        it('should not confuse count column with pg_catalog.count aggregate', async function() {
            const res = await get('/has_count_column');
            res.should.have.status(200);
        });
    });

    describe('Querying a nonexistent table', function() {
        it('causes a 404', async function() {
            const res = await appFetch('/faketable');
            res.should.have.property('status', 404);
        });
    });

    describe('Filtering response', function() {
        it('matches with equality', async function() {
            const res = await get('/items?id=eq.5');
            res.should.have.status(200);
            res.body.should.deep.equal([{id: 5}]);
            res.should.have.header('Content-Range', '0-0/1');
        });

        it('matches with equality using not operator', async function() {
            const res = await get('/items?id=not.eq.5');
            res.should.have.status(200);
            res.body.should.deep.equal([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 6},
                {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13},
                {id: 14}, {id: 15}]);
            res.should.have.header('Content-Range', '0-13/14');
        });

        it('matches with more than one condition using not operator', async function() {
            const res = await get('/simple_pk?k=like.*yx&extra=not.eq.u');
            res.body.should.deep.equal([]);
        });

        it('matches with inequality using not.lt operator', async function() {
            const res = await get('/items?id=not.lt.14&order=id.asc');
            res.should.have.status(200);
            res.body.should.deep.equal([{id: 14}, {id: 15}]);
            res.should.have.header('Content-Range', '0-1/2');
        });

        it('matches with inequality using not.gt operator', async function() {
            const res = await get('/items?id=not.gt.2&order=id.asc');
            res.should.have.status(200);
            res.body.should.deep.equal([{id: 1}, {id: 2}]);
            res.should.have.header('Content-Range', '0-1/2');
        });

        it('matches items IN', async function() {
            const res = await get('/items?id=in.1,3,5');
            res.should.have.status(200);
            res.body.should.deep.equal([{id: 1}, {id: 3}, {id: 5}]);
            res.should.have.header('Content-Range', '0-2/3');
        });

        it('matches items NOT IN', async function() {
            const res = await chai.request(app)
                .get('/items?id=notin.2,4,6,7,8,9,10,11,12,13,14,15');
            res.should.have.status(200);
            res.body.should.deep.equal([{id: 1}, {id: 3}, {id: 5}]);
            res.should.have.header('Content-Range', '0-2/3');
        });

        it('matches items NOT IN using not operator', async function() {
            const res = await chai.request(app)
                .get('/items?id=not.in.2,4,6,7,8,9,10,11,12,13,14,15');
            res.should.have.status(200);
            res.body.should.deep.equal([{id: 1}, {id: 3}, {id: 5}]);
            res.should.have.header('Content-Range', '0-2/3');
        });

        it('matches nulls using not operator', async function() {
            const res = await get('/no_pk?a=not.is.null');
            res.body.should.deep.equal([{a: '1', b: '0'}, {a: '2', b: '0'}]);
        });

        it('matches nulls in varchar and numeric fields alike', async function() {
            (await get('/no_pk?a=is.null'))
                .body.should.deep.equal([{a: null, b: null}]);
            (await get('/nullable_integer?a=is.null'))
                .body.should.deep.equal([{a: null}]);
        });

        it('matches with like', async function() {
            (await get('/simple_pk?k=like.*yx'))
                .body.should.deep.equal([{k: 'xyyx', extra: 'u'}]);
            (await get('/simple_pk?k=like.xy*'))
                .body.should.deep.equal([{k: 'xyyx', extra: 'u'}]);
            (await get('/simple_pk?k=like.*YY*'))
                .body.should.deep.equal([{k: 'xYYx', extra: 'v'}]);
        });

        it('matches with like using not operator', async function() {
            const res = await get('/simple_pk?k=not.like.*yx');
            res.body.should.deep.equal([{k:'xYYx', extra: 'v'}]);
        });

        it('matches with ilike', async function() {
            (await get('/simple_pk?k=ilike.xy*&order=extra.asc'))
                .body.should.deep.equal([
                    {k: 'xyyx', extra: 'u'},
                    {k: 'xYYx', extra: 'v'}
                ]);
            (await get('/simple_pk?k=ilike.*YY*&order=extra.asc'))
                .body.should.deep.equal([
                    {k: 'xyyx', extra: 'u'},
                    {k: 'xYYx', extra: 'v'}
                ]);
        });

        it('matches with ilike using not operator', async function() {
            const res = await get('/simple_pk?k=not.ilike.xy*&order=extra.asc');
            res.body.should.deep.equal([]);
        });

        it('matches with tsearch @@', async function() {
            const res = await get('/tsearch?text_search_vector=@@.foo');
            res.body.should.deep.equal([{text_search_vector: "'bar':2 'foo':1"}]);
        });

        it('matches with tsearch @@ using not operator', async function() {
            const res = await get('/tsearch?text_search_vector=not.@@.foo');
            res.body.should.deep.equal([{
                text_search_vector: "'baz':1 'qux':2"
            }]);
        });

        it('TODO: matches with computed column', async function() {
            const res = await get('/items?always_true=eq.true&order=id.asc');
            res.body.should.deep.equal([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6},
                {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13},
                {id: 14}, {id: 15}]);
        });

        it('TODO: order by computed column', async function() {
            const res = await get('/items?order=anti_id.desc');
            res.body.should.deep.equal([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6},
                {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13},
                {id: 14}, {id: 15}]);
        });

        it('TODO: matches filtering nested items', async function() {
            const res = await chai.request(app)
                .get('/clients?'
                    + 'select=id,projects{id,tasks{id,name}}&projects.tasks.name=like.Design*');
            res.body.should.deep.equal([{
                id: 1,
                projects: [{
                    id: 1,
                    tasks: [{
                        id: 1,
                        name: 'Design w7'
                    }]
                }, {
                    id: 2,
                    tasks: [{
                        id: 3,
                        name: 'Design w10'
                    }]
                }]
            }, {
                id: 2,
                projects: [{
                    id: 3,
                    tasks: [{
                        id: 5,
                        name: 'Design IOS'
                    }]
                }, {
                    id: 4,
                    tasks: [{
                        id: 7,
                        name: 'Design OSX'
                    }]
                }]
            }]);
        });

        it('matches with @> operator', async function() {
            const res = await get('/complex_items?select=id&arr_data=@>.{2}');
            res.body.should.deep.equal([{id: 2}, {id: 3}]);
        });

        it('matches with <@ operator', async function() {
            const res = await get('/complex_items?select=id&arr_data=<@.{1,2,4}');
            res.body.should.deep.equal([{id: 1}, {id: 2}]);
        });

        it('fails on unrecognized condition format', async function() {
            const res = await appFetch('/items?noop=ack.pth');
            res.should.have.property('status', 400);
        });
    });


    describe('Shaping response with select parameter', function() {
        it('selectStar works in absence of parameter', async function() {
            const res = await get('/complex_items?id=eq.3');
            res.body.should.deep.equal([{id: 3, name: 'Three',
                settings: {foo: {int: 1, bar: 'baz'}}, arr_data: [1, 2, 3]}]);
        });

        it('one simple column', async function() {
            const res = await get('/complex_items?select=id');
            res.body.should.deep.equal([{id: 1}, {id: 2}, {id: 3}]);
        });

        it('one simple column with casting (text)', async function() {
            const res = await get('/complex_items?select=id::text');
            res.body.should.deep.equal([{id: '1'}, {id: '2'}, {id: '3'}]);
        });

        it('json column', async function() {
            const res = await get('/complex_items?id=eq.1&select=settings');
            res.body.should.deep.equal([{settings: {foo: {int: 1, bar: 'baz'}}}]);
        });

        it('json subfield one level with casting (json)', async function() {
            const res = await chai.request(app)
                .get('/complex_items?id=eq.1&select=settings->>foo::json');
            res.body.should.deep.equal([{foo: {int: 1,bar: 'baz'}}]);
            // the value of foo here is of type "text"
        });

        it('fails on bad casting (data of the wrong format)', async function() {
            const res = await appFetch('/complex_items?select=settings->foo->>bar::integer');
            res.should.have.property('status', 400);
            const body = await res.json();
            body.should.have.property('code', '22P02');
            // TODO: check the full error object
            /*body.should.deep.equal({hint: null, details: null, code: '22P02',
                message: 'invalid input syntax for integer: "baz"'});*/
        });

        it('fails on bad casting (wrong cast type)', async function() {
            const res = await appFetch('/complex_items?select=id::fakecolumntype');
            res.should.have.property('status', 400);
            const body = await res.json();
            body.should.have.property('code', '42704');
            // TODO: check the full error object
            /*body.should.deep.equal({hint: null, details: null, code: '42704',
                message: 'type "fakecolumntype" does not exist'});*/
        });

        it('json subfield two levels (string)', async function() {
            const res = await chai.request(app)
                .get('/complex_items?id=eq.1&select=settings->foo->>bar');
            res.body.should.deep.equal([{bar: "baz"}]);
        });


        it('json subfield two levels with casting (int)', async function() {
            const res = await chai.request(app)
                .get('/complex_items?id=eq.1&select=settings->foo->>int::integer');
            res.body.should.deep.equal([{int: 1}]);
            // the value in the db is an int, but here we expect a string for now
        });

        it('TODO: requesting parents and children', async function() {
            const res = await chai.request(app)
                .get('/projects?id=eq.1&select=id, name, clients{*}, tasks{id, name}');
            res.body.should.deep.equal([{id: 1, name: "Windows 7",
                clients: {id: 1, name: "Microsoft"},
                tasks: [{id: 1, name: "Design w7"}, {id: 2, name: "Code w7"}]}]);
        });

        it('TODO: requesting parents and filtering parent columns', async function() {
            const res = await chai.request(app)
                .get('/projects?id=eq.1&select=id, name, clients{id}');
            res.body.should.deep.equal([{id: 1, name: "Windows 7", clients: {id: 1}}]);
        });

        it('TODO: rows with missing parents are included', async function() {
            const res = await get('/projects?id=in.1,5&select=id,clients{id}');
            res.body.should.deep.equal([{id: 1, clients: {id: 1}}, {id: 5, clients: null}]);
        });

        it('TODO: rows with no children return [] instead of null', async function() {
            const res = await get('/projects?id=in.5&select=id,tasks{id}');
            res.body.should.deep.equal([{id: 5, tasks: []}]);
        });

        it('TODO: requesting children 2 levels', async function() {
            const res = await chai.request(app)
                .get('/clients?id=eq.1&select=id,projects{id,tasks{id}}');
            res.body.should.deep.equal([{id: 1, projects: [{id: 1, tasks: [{id: 1}, {id: 2}]},
                {id: 2, tasks: [{id: 3}, {id: 4}]}]}]);
        });

        it('TODO: requesting many<->many relation', async function() {
            const res = await get('/tasks?select=id,users{id}');
            res.body.should.deep.equal([{id: 1, users: [{id: 1}, {id: 3}]},
                {id: 2, users: [{id: 1}]}, {id: 3, users: [{id: 1}]}, {id: 4, users: [{id: 1}]},
                {id: 5, users: [{id: 2}, {id: 3}]}, {id: 6, users: [{id: 2}]},
                {id: 7, users: [{id: 2}]}, {id: 8, users: []}]);
        });


        it('TODO: requesting many<->many relation reverse', async function() {
            const res = await get('/users?select=id,tasks{id}');
            res.body.should.deep.equal([{id: 1, tasks: [{id: 1}, {id: 2}, {id: 3}, {id: 4}]},
                {id: 2, tasks: [{id: 5}, {id: 6}, {id: 7}]}, {id: 3, tasks: [{id: 1}, {id: 5}]}]);
        });

        it('TODO: requesting parents and children on views', async function() {
            const res = await chai.request(app)
                .get('/projects_view?id=eq.1&select=id, name, clients{*}, tasks{id, name}');
            res.body.should.deep.equal([{id: 1, name: "Windows 7",
                clients: {id: 1, name: "Microsoft"},
                tasks: [{id: 1, name: "Design w7"}, {id: 2, name: "Code w7"}]}]);
        });

        it('TODO: requesting children with composite key', async function() {
            const res = await chai.request(app)
                .get('/users_tasks?user_id=eq.2&task_id=eq.6&select=*, comments{content}');
            res.body.should.deep.equal([{user_id: 2, task_id: 6,
                comments: [{content: "Needs to be delivered ASAP"}]}]);
        });

        it('TODO: detect relations in views from exposed schema '
            + 'that are based on tables in private schema '
            + 'and have columns renames', async function() {
            const res = await chai.request(app)
            .get('/articles?id=eq.1&select=id,articleStars{users{*}}');
            res.body.should.deep.equal([{id: 1,
                articleStars: [
                    {users: {id: 1, name: "Angela Martin"}},
                    {users: {id: 2, name: "Michael Scott"}},
                    {users: {id: 3, name: "Dwight Schrute"}}
                ]
            }]);
        });

        it('TODO: can select by column name', async function() {
            const res = await chai.request(app)
                .get('/projects?id=in.1,3&select=id,name,client_id,client_id{id,name}');
            res.body.should.deep.equal(`[{id: 1, name: 'Windows 7', client_id: 1,
                client_id: {id: 1, name: 'Microsoft'}},
                {id: 3, name: 'IOS', client_id: 2, client_id: {id: 2, name: 'Apple'}}]`);
            //FIXME: duplicate key client_id, determine what this case should really be
        });

        it('TODO: can select by column name sans id', async function() {
            const res = await chai.request(app)
                .get('/projects?id=in.1,3&select=id,name,client_id,client{id,name}');
            res.body.should.deep.equal(`[{id: 1, name: 'Windows 7', client_id: 1,
                client: {id: 1, name: 'Microsoft'}},
                {id: 3, name: 'IOS', client_id: 2, client: {id: 2, name: 'Apple'}}]`);
            //FIXME: duplicate key client_id, determine what this case should really be
        });
    });

    describe('Plurality singular', function() {
        it('will select an existing object', async function() {
            const res = await get('/items?id=eq.5')
                .set('Prefer', 'plurality=singular');
            res.should.have.status(200);
            res.body.should.deep.equal({id: 5});
        });

        it('works in the presence of a range header', async function() {
            const res = await get('/items')
                .set('Prefer', 'plurality=singular')
                .set('Range', '0-9')
                .set('Range-Unit', 'items');
            res.should.have.status(200);
            res.body.should.deep.equal({id: 1});
        });

        it('will respond with 404 when not found', async function() {
            const res = await appFetch('/items?id=eq.9999', {
                headers: {
                    Prefer: 'plurality=singular'
                }
            });
            res.should.have.property('status', 404);
        });

        it('TODO: can shape plurality singular object routes', async function() {
            const res = await get('/projects_view?id=eq.1&select=id,name,clients{*},tasks{id,name}')
                .set('Prefer', 'plurality=singular');

            res.body.should.deep.equal({id: 1, name: 'Windows 7',
                clients: {id: 1, name: 'Microsoft'},
                tasks: [{id: 1, name: 'Design w7'}, {id: 2, name: 'Code w7'}]});
        });
    });

    describe('remote procedure call', function() {
        describe('a proc that returns a set', function() {
            it('returns paginated results', async function() {
                const res = await post('/rpc/getitemrange')
                    .set('Range', '0-0')
                    .set('Range-Unit', 'items')
                    .send({
                        min: 2,
                        max: 4
                    });
                res.body.should.deep.equal([{id: 3}]);
                res.should.have.header('Content-Range', '0-0/2');
                res.should.have.status(206);
            });

            it('returns proper json', async function() {
                const res = await post('/rpc/getitemrange')
                    .send({min: 2, max: 4 });
                res.body.should.deep.equal([{id: 3}, {id: 4}]);
            });
        });
        describe('a proc that returns an empty rowset', function() {
            it('returns empty json array', async function() {
                const res = await post('/rpc/test_empty_rowset')
                .send({});
                res.body.should.deep.equal([]);
            });
        });

        describe('a proc that returns plain text', function() {
            it('returns proper json', async function() {
                const res = await post('/rpc/sayhello')
                    .send({name: 'world' });
                res.body.should.deep.equal([{sayhello: 'Hello, world'}]);
            });

            it('TODO: can handle unicode', async function() {
                const res = await post('/rpc/sayhello')
                    .send({name: '￥' });
                res.body.should.deep.equal([{sayhello: 'Hello, ￥'}]);
            });
        });

        describe('improper input', function() {
            it('TODO: rejects unknown content type even if payload is good', async function() {
                const res = await fPost('/rpc/sayhello',
                    {name: 'world'},
                    {headers: {'Accept': 'audio/mpeg3'}})
                res.should.have.status(415);
            });
            it('rejects malformed json payload', async function() {
                const res = await fPost('/rpc/sayhello',
                    'sdfsdf', {headers: {'Accept': 'application/json'}});
                res.should.have.status(400);
            });
        });

        describe('unsupported verbs', function() {
            it('DELETE fails', async function() {
                const res = await fDelete('/rpc/sayhello');
                res.should.have.status(405);
            });
            it('PATCH fails', async function() {
                const res = await fPatch('/rpc/sayhello');
                res.should.have.status(405);
            });
            it('OPTIONS fails', async function() {
                // NOTE: may change in a future postgrest version
                const res = await fOptions('/rpc/sayhello');
                res.should.have.status(405);
            });
            it('GET fails with 405 on unknown procs', async function() {
                // NOTE: may change in a future postgrest version
                const res = await appFetch('/rpc/fake');
                res.should.have.status(405);
            });
            it('GET with 405 on known procs', async function() {
                const res = await appFetch('/rpc/sayhello');
                res.should.have.status(405);
            });
        });
        it('executes the proc exactly once per request', async function() {
            let res = await post('/rpc/callcounter')
                .send({});
            res.body.should.deep.equal([{callcounter: 1}]);
            res = await post('/rpc/callcounter')
                .send({});
            res.body.should.deep.equal([{callcounter: 2}]);
        });
    });
});
