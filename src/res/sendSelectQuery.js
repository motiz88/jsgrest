export default async function sendSelectQuery(query, ...queryParams) {
    if (this.dbReadResult)
        throw new Error('Tried to overwrite existing res.dbReadResult');

    this.dbReadResult = await this.execQuery(query, ...queryParams);
}
