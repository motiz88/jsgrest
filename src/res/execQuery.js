import pg from '@motiz88/pg';

export default function execQuery(query, ...queryParams) {
    if (typeof query === 'string')
    {
        query = {text: query, values: queryParams};
    }
    return new Promise(
        (resolve, reject) => pg.connect(this.dbConfig.connectionString, (err, client, done) => {
            if (err) {
                done();
                return reject(err);
            }
            client.query(query, (err, result) => {
                done();

                if (err) {
                    console.log(query.text, query.values);
                    return reject(err);
                }
                resolve(result);
            });
        }));
}
