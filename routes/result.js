var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Result hinzufügen */
router.post('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
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

    executeQuery("CALL InsertResult(?,?,?)", [data.resultScore, data.userId, data.focusId], res,
        (result) => {
            if (result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("User not found"));
            } else if (result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("Focus not found"));
            } else {
                res.status(201).json(createSuccessResponse({focus: result[0][0]}));
            }
        },
        (error) => {
            console.log(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

module.exports = router;
