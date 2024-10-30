var express = require('express');
var router = express.Router();
const {response} = require("express");
const { executeQuery } = require("../config/database");
const { validateParams } = require("../config/validator");
const { createErrorResponse, createSuccessResponse } = require("../config/response");

/* Fach hinzufügen */
router.post('/', function(req, res, next) {
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

module.exports = router;
