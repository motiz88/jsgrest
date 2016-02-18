import arrayLiteralParser from './peg/arrayLiteral';
import pgEscape from 'pg-escape';
import sql from './sqlTemplate';

export default function arrayLiteralToSql(arrayLiteral)  {
    const parsed = arrayLiteralParser.parse(arrayLiteral);
    return sql `${parsed}`;
}
