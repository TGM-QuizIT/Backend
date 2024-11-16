var express = require('express');
var router = express.Router();
const { executeQuery } = require("../config/database");
const { validateParams, validateString, validateIntBody, validateBoolean, validateIntQuery} = require("../config/validator");
const { createErrorResponse, createSuccessResponse } = require("../config/response");

/* Fach hinzufügen */
router.post('/', function(req, res) {
    const data = req.body;

    // Check, if all necessary parameters are there
    const missingParam = validateParams(data, ["subjectName", "subjectImageAddress"], res);
    if (missingParam) {
        return res.status(400).json(createErrorResponse(`Missing parameter: ${missingParam}`));
    }

    /* Check, if parameters are of the correct type */
    if (!validateString(data.subjectName)) {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: subjectName. Expected string.'));
    }
    if (!validateString(data.subjectImageAddress)) {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: subjectImageAddress. Expected string.'));
    }

    executeQuery("CALL InsertSubject(?,?)", [data.subjectName, data.subjectImageAddress], res,
        (result) => {
            res.status(201).json(createSuccessResponse({ subject: result[0][0] }));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Fach löschen */
router.delete('/', function(req, res) {
    // Check if mandatory parameter is present
    if(!req.query.id) {
        return res.status(400).json(createErrorResponse("Missing parameter: id"));
    }

    const id = parseInt(req.query.id, 10);

    // Check if parameter is the correct type
    if (!validateIntQuery(id)) {
        return res.status(422).json(createErrorResponse("Invalid type for parameter: id. Expected integer."));
    }

    executeQuery("CALL DeleteSubject(?)", [id], res,
        (result) => {
            const affectedRows = result[1].affectedRows;
            if (affectedRows === 0) {
                return res.status(404).json(createErrorResponse("Subject not found"));
            } else {
                return res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Fach bearbeiten */
router.put('/', function(req, res) {
   const data = req.body;
    /* Check, if all needed parameters are there */
    const missingParam = validateParams(data, ["subjectId", "subjectActive", "subjectImageAddress"]);
    if (missingParam) return res.status(400).json(createErrorResponse(missingParam));

    if(!validateIntBody(data.subjectId)) return res.status(422).json(createErrorResponse(`Invalid type for parameter: subjectId. Expected integer.`));
    if(!validateBoolean(data.subjectActive)) return res.status(422).json(createErrorResponse(`Invalid type for parameter: subjectActive. Expected boolean.`));
    if(!validateString(data.subjectImageAddress)) return res.status(422).json(createErrorResponse(`Invalid type for parameter: subjectImageAddress. Expected string.`));

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
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Alle Fächer (eines Users) holen */
router.get('/', function(req, res) {
    const idParam = req.query.id;
    if (idParam !== undefined && !validateIntQuery(idParam)) {
        return res.status(422).json(createErrorResponse("Invalid type for parameter: id. Expected integer."));
    }

    const id = idParam ? parseInt(idParam, 10) : null;
    executeQuery("CALL GetSubjects(?)", [id], res,
        (result) => {
            if (result[0][0].result == 0) {
                res.status(404).json(createErrorResponse("User not found"));
            }
            else {
                const response = {
                    subjects: result[0],
                    ...(id !== null && {userId: id})
                };
                res.status(200).json(createSuccessResponse(response));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});


module.exports = router;

