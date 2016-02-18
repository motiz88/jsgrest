import pgEscape from 'pg-escape';
import fieldPathToSql from '../fieldPathToSql';
import fieldPathToSimpleName from '../fieldPathToSimpleName';
import selectFieldsParser from '../peg/selectFields';

export default function requestToColumnList(req) {
    const selectFields =  selectFieldsParser.parse((req.query || {}).select || '')
        .map(field => {
            const path = fieldPathToSql(field.name);
            const name = pgEscape.ident(fieldPathToSimpleName(field.name));
            if (field.cast) {
                const type = pgEscape.ident(field.cast);
                return `(${path})::${type} AS ${name}`;
            }
            else if (fieldPathToSimpleName(field.name) !== field.name)
                return `${path} AS ${name}`;
            else
                return path;
        })
        .join(', ');
    return selectFields || '*';
}
