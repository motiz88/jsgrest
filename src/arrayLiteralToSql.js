import arrayLiteralParser from './peg/arrayLiteral';
import sql from './sqlTemplate';

export default function arrayLiteralToSql(arrayLiteral)  {
    const parsed = arrayLiteralParser.parse(arrayLiteral);
    return sql `${parsed}`;
}
