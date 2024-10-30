var express = require('express');
var router = express.Router();
const { executeQuery } = require("../config/database");
const { validateParams } = require("../config/validator");
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
    if (typeof data.subjectName !== 'string') {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: subjectName. Expected string.'));
    }
    if (typeof data.subjectImageAddress !== 'string') {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: subjectImageAddress. Expected string.'));
    }

    executeQuery("CALL InsertSubject(?,?)", [data.subjectName, data.subjectImageAddress], res, (result) => {
        res.status(201).json(createSuccessResponse({ subject: result[0][0] }));
    });
});

/* Fach löschen */
router.delete('/', function(req, res) {
    //Check, if mandatory parameter is present
    if(!req.query.id) {
        return res.status(400).json(createErrorResponse("Missing parameter: id"));
    }

    const id = parseInt(req.query.id, 10);

    /* Check, if parameter is the correct type */
    if (isNaN(id)) {
        return res.status(422).json(createErrorResponse("Invalid type for parameter: id. Expected integer."));
    }

    executeQuery("CALL DeleteSubject(?)", [id], res, (result) => {
        const affectedRows = result[0][0].affectedRows;
        if (affectedRows === 0) {
            res.status(404).json(createErrorResponse("Subject not found"));
        } else {
            res.status(200).json(createSuccessResponse());
        }
    });
});
module.exports = router;
