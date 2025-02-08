var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    formatError
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Resultat eines Schwerpunktes hinzufügen */
router.post('/', function (req, res) {
    const data = req.body;
    const expected = {
        resultScore: 'number',
        userId: 'number',
        focusId: 'number'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    if (data.resultScore > 100 || data.resultScore < 0) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: resultScore. Must be between 0 and 100."));
    }

    executeQuery("CALL InsertResult(?,?,?,?)", [data.resultScore, data.userId, data.focusId, null], res,
        (result) => {
            if (result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("User not found"));
            } else if (result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("Focus not found"));
            } else {
                const resp = result[0][0];
                const formatted = {
                    resultId: resp.resultId,
                    resultScore: resp.resultScore,
                    resultDateTime: resp.resultDateTime,
                    userId: resp.userId,
                    focus: {
                        focusId: resp.focusId,
                        focusName: resp.focusName,
                        focusYear: resp.focusActive,
                        focusActive: resp.focusActive === 1,
                        focusImageAddress: resp.focusImageAddress,
                        subjectId: resp.fSubjectId
                    }
                }
                res.status(201).json(createSuccessResponse({result: formatted}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Resultat eines Faches hinzufügen */
router.post('/subject', function (req, res) {
    const data = req.body;
    const expected = {
        resultScore: 'number',
        userId: 'number',
        subjectId: 'number'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    if (data.resultScore > 100 || data.resultScore < 0) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: resultScore. Must be between 0 and 100."));
    }

    executeQuery("CALL InsertResult(?,?,?,?)", [data.resultScore, data.userId, null, data.subjectId], res,
        (result) => {
            if (result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("User not found"));
            } else if (result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("Subject not found"));
            } else {
                const resp = result[0][0];
                const formatted = {
                    resultId: resp.resultId,
                    resultScore: resp.resultScore,
                    resultDateTime: resp.resultDateTime,
                    userId: resp.userId,
                    subject: {
                        subjectId: resp.subjectId,
                        subjectName: resp.subjectName,
                        subjectActive: resp.subjectActive === 1,
                        subjectImageAddress: resp.subjectImageAddress
                    }
                }
                res.status(201).json(createSuccessResponse({result: formatted}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Resultat löschen */
router.delete('/', function(req, res) {
    const data = req.query;
    const expected = {
        id: 'number',
    };

    if(validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL DeleteResult(?)", [data.id], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Result not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Resultat eines Benutzers (und Schwerpunktes) holen */
router.get('/', function (req, res) {
    const data = req.query;
    const expected = {
        userId: 'number',
        focusId: 'optional number',
        subjectId: 'optional number',
        amount: 'optional number'
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetResults(?,?,?,?)", [data.userId, data.focusId, data.subjectId, data.amount], res,
        (result) => {
            if (result[0].length === 0) {
                res.status(200).json(createSuccessResponse({results: []}));
            }
            else if (result[0][0] && result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("User not found"));
            } else if (result[0][0] && result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("Focus or subject not found"));
            } else {
                const formattedResults = [];
                const resp = result[0];

                resp.forEach(r => {
                    var formattedResult = {
                        resultId: r.resultId,
                        resultScore: r.resultScore,
                        resultDateTime: r.resultDateTime,
                        userId: r.userId
                    };

                    if (r.focusId !== null) {
                        formattedResult.focus = {
                            focusId: r.focusId,
                            focusName: r.focusName,
                            focusYear: r.focusActive,
                            focusActive: r.focusActive === 1,
                            focusImageAddress: r.focusImageAddress,
                            subjectId: r.fSubjectId
                        };
                    }

                    if (r.subjectId !== null) {
                        formattedResult.subject = {
                            subjectId: r.subjectId,
                            subjectName: r.subjectName,
                            subjectActive: r.subjectActive === 1,
                            subjectImageAddress: r.subjectImageAddress
                        };
                    }

                    formattedResults.push(formattedResult);
                });


                res.status(200).json(createSuccessResponse({results: formattedResults}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

module.exports = router;
