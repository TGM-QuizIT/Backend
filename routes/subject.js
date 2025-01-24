var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    formatError
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Fach hinzufügen */
router.post('/', function (req, res) {
    const data = req.body;
    const expected = {
        subjectName: 'string',
        subjectImageAddress: 'string'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL InsertSubject(?,?)", [data.subjectName, data.subjectImageAddress], res,
        (result) => {
            res.status(201).json(createSuccessResponse({subject: result[0][0]}));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Fach löschen */
router.delete('/', function (req, res) {
    const data = req.query;
    const expected = {
        id: 'number',
    };

    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL DeleteSubject(?)", [data.id], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Subject not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Fach bearbeiten */
router.put('/', function (req, res) {
    const data = req.body;
    const expected = {
        subjectId: 'number',
        subjectActive: 'boolean',
        subjectImageAddress: 'string'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL UpdateSubject(?, ?, ?)", [data.subjectId, data.subjectActive, data.subjectImageAddress], res,
        (result) => {
            const subject = result[0][0];
            if (!subject) {
                res.status(404).json(createErrorResponse("Subject not found"));
            } else {
                res.status(200).json(createSuccessResponse({subject: subject}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Alle Fächer (eines Users) holen */
router.get('/', function (req, res) {
    const data = req.query;
    const expected = {
        id: 'optional number'
    };

    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetSubjects(?)", [req.query.id], res,
        (result) => {
            if (result[0].length === 0) {
                const response = {
                    subjects: [],
                    ...(req.query.id !== null && {userId: req.query.id})
                };
                res.status(200).json(createSuccessResponse(response));
            } else if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User not found"));
            } else {
                const response = {
                    subjects: result[0],
                    ...(req.query.id !== null && {userId: req.query.id})
                };
                res.status(200).json(createSuccessResponse(response));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});


module.exports = router;

