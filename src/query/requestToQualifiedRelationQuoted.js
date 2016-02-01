import pgEscape from 'pg-escape';

export default function requestToQualifiedRelationQuoted(req) {
    return pgEscape.ident(req.dbConfig.schema) + '.' + pgEscape.ident(req.params.relation);
}
