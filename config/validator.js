const {createErrorResponse} = require("./response");

function validateBody(data, expected, res) {
    function checkStructure(dataObj, expectedObj, parentKey = '') {
        for (const key in expectedObj) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const expectedType = expectedObj[key];
            const isOptional = typeof expectedType === 'string' && expectedType.startsWith('optional');

            if (!(key in dataObj)) {
                if (isOptional) continue; // Skip optional fields if missing
                res.status(400).json(createErrorResponse(`Missing parameter: ${fullKey}`));
                return true;
            }

            const actualValue = dataObj[key];

            if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
                if (typeof actualValue !== 'object' || Array.isArray(actualValue)) {
                    res.status(422).json(
                        createErrorResponse(
                            `Invalid type for parameter: ${fullKey}. Expected object.`
                        )
                    );
                    return true;
                }
                if (checkStructure(actualValue, expectedType, fullKey)) return true;
            } else if (Array.isArray(expectedType)) {
                if (!Array.isArray(actualValue)) {
                    res.status(422).json(
                        createErrorResponse(
                            `Invalid type for parameter: ${fullKey}. Expected array.`
                        )
                    );
                    return true;
                }
                if (expectedType.length === 1 && typeof expectedType[0] === 'object') {
                    for (let i = 0; i < actualValue.length; i++) {
                        if (checkStructure(actualValue[i], expectedType[0], `${fullKey}[${i}]`)) {
                            return true;
                        }
                    }
                } else if (
                    expectedType.length === 1 &&
                    typeof expectedType[0] !== typeof actualValue[0]
                ) {
                    res.status(422).json(
                        createErrorResponse(
                            `Invalid type for parameter: ${fullKey}. Expected array of ${typeof expectedType[0]}.`
                        )
                    );
                    return true;
                }
            } else {
                const cleanType = isOptional ? expectedType.replace('optional', '').trim() : expectedType;
                if (typeof actualValue !== cleanType) {
                    res.status(422).json(
                        createErrorResponse(
                            `Invalid type for parameter: ${fullKey}. Expected ${cleanType}.`
                        )
                    );
                    return true;
                }
            }
        }
        return false;
    }

    return checkStructure(data, expected);
}

function validateQuery(query, expected, res) {
    for (const key in expected) {
        const expectedType = expected[key];
        const isOptional = typeof expectedType === 'string' && expectedType.startsWith('optional');

        if (!(key in query)) {
            if (isOptional) continue;
            res.status(400).json(createErrorResponse(`Missing parameter: ${key}`));
            return true;
        }

        const actualValue = query[key];

        if (expectedType === 'number' || expectedType === 'optional number') {
            if (isNaN(Number(actualValue))) {
                res.status(422).json(
                    createErrorResponse(
                        `Invalid type for parameter: ${key}. Expected number.`
                    )
                );
                return true;
            }
        } else {
            const cleanType = isOptional ? expectedType.replace('optional', '').trim() : expectedType;
            if (typeof actualValue !== cleanType) {
                res.status(422).json(
                    createErrorResponse(
                        `Invalid type for parameter: ${key}. Expected ${cleanType}.`
                    )
                );
                return true;
            }
        }
    }

    return false;
}

function validateKey(req, res) {
    const key = req.headers['authorization'];

    if(!key) {
        res.status(401).json(createErrorResponse("Unauthorized: No API key provided."));
        return false;
    }

    if (key !== process.env.API_KEY) {
        res.status(403).json(createErrorResponse("Forbidden: Invalid API key."));
        return false;
    }

    return true;
}


module.exports = {validateBody, validateQuery, validateKey};