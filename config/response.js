/* Function, which creates an object for a failed response */
function createErrorResponse(reason, details = {}) {
    return{ status: "Failure", reason, ...details };
}

/* Function, which creates an object for a successful response */
function createSuccessResponse(data = {}) {
    return {status: "Success", ...data};
}

module.exports = {createSuccessResponse, createErrorResponse};