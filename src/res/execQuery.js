import pg from '@motiz88/pg';

export default function execQuery(query, ...queryParams) {
    if (typeof query === 'string')
    {
        query = {text: query, values: queryParams};
    }
    return new Promise(
        (resolve, reject) =>
            (pg.native || pg).connect(this.dbConfig.connectionString, (err, client, done) => {
                if (err) {
                    console.log(query.text, query.values);
                    done();
                    return reject(err);
                }
                client.query(query, (err, result) => {
                    done();

                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            }));
}
