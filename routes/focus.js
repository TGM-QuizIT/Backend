var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Focus hinzufügen */
router.post('/', function (req, res) {
    const data = req.body;
    const expected = {
        focusName: 'string',
        focusYear: 'number',
        focusImageAddress: 'string',
        subjectId: 'number'
    };

    if (validateBody(data, expected, res)) {
        return;
    }
    if(data.focusYear > 5 || data.focusYear < 1) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: focusYear. Must be between 1 and 5."));
    }

    executeQuery("CALL InsertFocus(?,?,?,?)", [data.focusName, data.focusYear, data.focusImageAddress, data.subjectId], res,
        (result) => {
            res.status(201).json(createSuccessResponse({focus: result[0][0]}));
        },
        (error) => {
            /* Error number for an invalid foreign key (subjectId) */
            if (error.errno == 1452) {
                res.status(404).json(createErrorResponse('subjectId not found'))
            } else {
                res.status(500).json(createErrorResponse('Internal Server Error'));
            }
        }
    );
});

/* Focus löschen */
router.delete('/', function (req, res) {
    const data = req.query;
    const expected = {
        id: 'number',
    };

    if(validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL DeleteFocus(?)", [req.query.id], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Subject not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Focus bearbeiten */
router.put('/', function (req, res) {
    const data = req.body;
    const expected = {
        focusId: 'number',
        focusName: 'string',
        focusYear: 'number',
        focusImageAddress: 'string',
        subjectId: 'number',
        focusActive: 'boolean'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL UpdateFocus(?,?,?,?,?,?)", [data.focusId, data.focusName, data.focusYear, data.focusActive, data.focusImageAddress, data.subjectId], res,
        (result) => {
            const focus = result[0][0];
            if (!focus) {
                res.status(404).json(createErrorResponse("Focus not found"));
            } else {
                res.status(200).json(createSuccessResponse({focus: focus}));
            }
        },
        (error) => {
            /* Error number for invalid foreign key (subjectId) */
            if (error.errno == 1452) {
                res.status(404).json(createErrorResponse('subjectId not found'))
            } else {
                res.status(500).json(createErrorResponse('Internal Server Error'));
            }
        }
    );

});

/* Alle (aktiven) Schwerpunkte zu einem Fach (und Jahr) holen */
router.get('/', function (req, res) {
    const data = req.query;
    const expected = {
        id: 'number',
        year: 'optional number',
        active: 'optional number'
    };

    if(validateQuery(data, expected, res)) {
        return;
    }

    if (req.query.active !== undefined && req.query.active != 0 && req.query.active != 1) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: active. Must be either 0 or 1."));
    }


    executeQuery("CALL GetFocus(?,?,?)", [req.query.id, req.query.year, req.query.active], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Subject not found"));
            } else {
                res.status(200).json(createSuccessResponse({focus: result[0]}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

module.exports = router;


