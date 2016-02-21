import fieldPathParser from './peg/fieldPath';

export default function fieldPathToSimpleName(fieldPath)  {
    let parsed;
    try {
        parsed = fieldPathParser.parse(fieldPath);
    } catch(e) {
        /* istanbul ignore else */
        if (e instanceof fieldPathParser.SyntaxError)
            return fieldPath;
        else
            throw e;
    }

    return parsed[parsed.length-1].name;
}
