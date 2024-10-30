/* Function, which creates an object for a successful response */
function createErrorResponse(reason) {
    return {status: "Failure", reason: reason};
}

/* Function, which creates an object for a failed response */
function createSuccessResponse(data = {}) {
    return {status: "Success", ...data};
}

module.exports = {createSuccessResponse, createErrorResponse};