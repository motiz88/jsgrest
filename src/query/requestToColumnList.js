import pgEscape from 'pg-escape';
import fieldPathToSql from '../fieldPathToSql';
import selectFieldsParser from '../peg/selectFields';

export default function requestToColumnList(req) {
    const selectFields =  selectFieldsParser.parse((req.query || {}).select || '')
        .map(field => {
            const name = fieldPathToSql(field.name);
            if (field.cast)
                return name + '::' + pgEscape.ident(field.cast);
            else
                return name;
        })
        .join(', ');
    return selectFields || '*';
}
