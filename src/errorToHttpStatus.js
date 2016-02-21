const codes = {
    '23502': 400,
    '23503': 409, // foreign_key_violation
    '23505': 409, // unique_violation
    '42P01': 404, // undefined table
    '42501': 404, // insufficient privilege

    '08': 503, // pg connection err
    '09': 500, // triggered action exception
    '0L': 403, // invalid grantor
    '0P': 403, // invalid role specification

    '25': 500, // invalid tx state
    '28': 403, // invalid auth specification
    '2D': 500, // invalid tx termination
    '38': 500, // external routine exception
    '39': 500, // external routine invocation
    '3B': 500, // savepoint exception
    '40': 500, // tx rollback
    '53': 503, // insufficient resources
    '54': 413, // too complex
    '55': 500, // obj not on prereq state
    '57': 500, // operator intervention
    '58': 500, // system error
    'F0': 500, // conf file error
    'HV': 500, // foreign data wrapper error
    'P0': 500, // PL/pgSQL Error
    'XX': 500, // internal Error
};

export default function errorToHttpStatus(error) {
    const code = (error ? error.code : '') || '';
    for (let codePrefix of [code, code.substr(0, 2)])
        if (codePrefix in codes)
            return codes[codePrefix];
    /* istanbul ignore next */
    return 400;
}
