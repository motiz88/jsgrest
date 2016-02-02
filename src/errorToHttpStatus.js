export default function errorToHttpStatus(error) {
    const code = (error ? error.code : '') || '';
    switch (code) {
        case '23503':
            return 409; // foreign_key_violation
        case '23505':
            return 409; // unique_violation
        case '42P01':
            return 404; // undefined table
        case '42501':
            return 404; // insufficient privilege
    }

    switch (code.substr(0, 2)) {
        case '08':
            return 503; // pg connection err
        case '09':
            return 500; // triggered action exception
        case '0L':
            return 403; // invalid grantor
        case '0P':
            return 403; // invalid role specification


        case '25':
            return 500; // invalid tx state
        case '28':
            return 403; // invalid auth specification
        case '2D':
            return 500; // invalid tx termination
        case '38':
            return 500; // external routine exception
        case '39':
            return 500; // external routine invocation
        case '3B':
            return 500; // savepoint exception
        case '40':
            return 500; // tx rollback
        case '53':
            return 503; // insufficient resources
        case '54':
            return 413; // too complex
        case '55':
            return 500; // obj not on prereq state
        case '57':
            return 500; // operator intervention
        case '58':
            return 500; // system error
        case 'F0':
            return 500; // conf file error
        case 'HV':
            return 500; // foreign data wrapper error
        case 'P0':
            return 500; // PL/pgSQL Error
        case 'XX':
            return 500; // internal Error

        default:
            return 400;
    }
}
