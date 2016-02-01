import pg from '@motiz88/pg';

export default function execQuery(query, ...queryParams) {
    return new Promise(
        (resolve, reject) => pg.connect(this.dbConfig.connectionString, (err, client, done) => {
            if (err) {
                done();
                return reject(err);
            }
            client.query(query, queryParams || [], (err, result) => {
                done();

                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        }));
}
