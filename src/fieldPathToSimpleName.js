import fieldPathParser from './peg/fieldPath';

export default function fieldPathToSimpleName(fieldPath)  {
    let parsed;
    try {
        parsed = fieldPathParser.parse(fieldPath);
    } catch(e) {
        if (e instanceof fieldPathParser.SyntaxError)
            return fieldPath;
        throw e;
    }

    let result = '';

    return parsed[parsed.length-1].name;
}
