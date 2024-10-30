/* Function, which checks, if all parameters are present */
function validateParams(data, requiredParams, res) {
    for (const param of requiredParams) {
        if (!(param in data)) {
            return `Missing parameter: ${param}`;
        }
    }
    return null;
}

module.exports = { validateParams };