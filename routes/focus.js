var express = require('express');
var router = express.Router();
const { executeQuery } = require("../config/database");
const { validateParams, validateString, validateIntBody, validateBoolean, validateIntQuery} = require("../config/validator");
const { createErrorResponse, createSuccessResponse } = require("../config/response");

/* Focus hinzufügen */
router.post('/', function(req, res)     {
   const data = req.body;

    // Check, if all necessary parameters are there
    const missingParam = validateParams(data, ["focusName", "focusYear", "focusImageAddress", "subjectId"], res);
    if (missingParam) {
        return res.status(400).json(createErrorResponse(`Missing parameter: ${missingParam}`));
    }

    /* Check, if parameters are of the correct type */
    if(!validateString(data.focusName)) {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: focusName. Expected string.'));
    }
    if(!validateIntBody(data.focusYear)) {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: focusYear. Expected integer.'));
    } else if (data.focusYear > 5 || data.focusYear < 1) {
        return res.status(422).json(createErrorResponse('Invalid value for parameter: focusYear. Must be between 1 and 5.'));
    }
    if(!validateString(data.focusImageAddress)) {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: focusImageAddress. Expected string.'));
    }
    if(!validateIntBody(data.subjectId)) {
        return res.status(422).json(createErrorResponse('Invalid type for parameter: subjectId. Expected integer.'));
    }

    executeQuery("CALL InsertFocus(?,?,?,?)", [data.focusName, data.focusYear, data.focusImageAddress, data.subjectId], res,
        (result) => {
            res.status(201).json(createSuccessResponse({ focus: result[0][0] }));
        },
        (error) => {
            /* Error number for invalid foreign key (subjectId) */
            if(error.errno == 1452) {
                res.status(404).json(createErrorResponse('subjectId not found'))
            } else {
                res.status(500).json(createErrorResponse('Internal Server Error'));
            }
        }
    );
});

/* Focus löschen */
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

    executeQuery("CALL DeleteFocus(?)", [id], res,
        (result) => {
            const affectedRows = result[1].affectedRows;
            if (affectedRows === 0) {
                return res.status(404).json(createErrorResponse("Focus not found"));
            } else {
                return res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

module.exports = router;


