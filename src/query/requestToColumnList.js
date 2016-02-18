import pgEscape from 'pg-escape';
import fieldPathToSql from '../fieldPathToSql';
import selectFieldsParser from '../peg/selectFields';

export default function requestToColumnList(req) {
    const selectFields =  selectFieldsParser.parse((req.query || {}).select || '')
        .map(field => {
            const name = fieldPathToSql(field.name);
            if (field.cast) {
                const type = pgEscape.ident(field.cast);
                return `(${name})::${type}`;
            }
            else
                return name;
        })
        .join(', ');
    return selectFields || '*';
}
