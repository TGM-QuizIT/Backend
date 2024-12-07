var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Resultat hinzufügen */
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

/* Resultat löschen */
router.delete('/', function(req, res) {
    if (!validateKey(req,res)) {
        return;
    }
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
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Resultat bearbeiten */
router.put('/', function (req, res) {
    if (!validateKey(req,res)) {
        return;
    }
    const data = req.body;
    const expected = {
        resultId: 'number',
        resultScore: 'number',
        userId: 'number',
        focusId: 'number',
        resultDate: 'string'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (!dateRegex.test(data.resultDate)) {
        res.status(422).json(
            createErrorResponse(
                `Invalid format for parameter resultDate`
            )
        );
    }

    executeQuery("CALL UpdateResult(?,?,?,?,?)", [data.resultId, data.resultScore, data.userId, data.focusId, data.resultDate], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Result not found"));
            } else {
                res.status(200).json(createSuccessResponse({result: result[0][0]}));
            }
        },
        (error) => {
            /* Error number for invalid foreign key (userId oder focusId) */
            if (error.errno == 1452) {
                res.status(404).json(createErrorResponse('userId or focusId not found'))
            } else {
                res.status(500).json(createErrorResponse('Internal Server Error'));
            }
        }
    );

});

/* Resultat eines Benutzers (und Schwerpunktes) holen */
router.get('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.query;
    const expected = {
        userId: 'number',
        focusId: 'optional number',
        amount: 'optional number'
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetResults(?,?,?)", [data.userId, data.focusId, data.amount], res,
        (result) => {
            if (result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("User not found"));
            } else if (result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("Focus not found"));
            } else {
                res.status(200).json(createSuccessResponse({results: result[0]}));
            }
        },
        (error) => {
            console.log(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

module.exports = router;
