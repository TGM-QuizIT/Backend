var express = require('express');
var router = express.Router();
const { executeQuery } = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey
} = require("../config/validator");
const { createErrorResponse, createSuccessResponse } = require("../config/response");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Question' });
});

/* Fach löschen */
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

    executeQuery("CALL DeleteQuestion(?)", [data.id], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Question not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

module.exports = router;
