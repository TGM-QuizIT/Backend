/* Function, which checks, if all parameters are present */
function validateParams(data, requiredParams) {
    for (const param of requiredParams) {
        if (!(param in data)) {
            return `Missing parameter: ${param}`;
        }
    }
    return null;
}

/* Function, which checks if data is of the type string */
function validateString (data) {
    return typeof data === 'string';
}

/* Function, which checks if data is of the type integer */
function validateIntQuery(data) {
    const num = Number(data);
    return Number.isInteger(num);
}

/* Function, which checks if data is of the type integer */
function validateIntBody (data) {
    return (typeof data === 'number' && Number.isInteger(data))
}

/* Function, which checks if data is of the type boolean */
function validateBoolean (data) {
    return typeof data === 'boolean';
}

module.exports = { validateParams, validateString, validateIntQuery, validateIntBody, validateBoolean };