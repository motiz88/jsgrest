import pg from '@motiz88/pg';

export default async function sendSelectQuery(query, ...queryParams) {
    query = `SELECT array_to_json(array_agg(row_to_json(t))) FROM (${query}) t`;
    const dbResult = await this.execQuery(query, ...queryParams);
    if (dbResult.rows && dbResult.rows.length)
        this.json(dbResult.rows[0].array_to_json || []);
}
