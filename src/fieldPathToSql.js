import fieldPathParser from './peg/fieldPath';
import pgEscape from 'pg-escape';

export default function fieldPathToSql(fieldPath)  {
    let parsed;
    try {
        parsed = fieldPathParser.parse(fieldPath);
    } catch(e) {
        /* istanbul ignore else */
        if (e instanceof fieldPathParser.SyntaxError)
            return pgEscape.ident(fieldPath);
        else
            throw e;
    }

    let result = '';
    parsed.forEach(part => {
        switch(part.type) {
            case 'field':
                result += pgEscape.ident(part.name);
                break;
            case '->':
            /* falls through */
            case '->>':
                result += part.type + pgEscape.literal(part.name);
                break;
            default:
                throw new Error(`Cannot parse field path ${fieldPath}`);
        }
    });
    return result;
}
