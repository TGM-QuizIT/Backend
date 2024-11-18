var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");


/* User hinzufügen */
router.post('/', function (req, res) {
    const data = req.body;
    const expected = {
        userName: 'string',
        userYear: 'number'
    };

    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL InsertUser(?,?)", [data.userName, data.userYear], res,
        (result) => {
            res.status(201).json(createSuccessResponse({user: result[0][0]}));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* User löschen */
router.delete('/', function (req, res) {
    const data = req.query;
    const expected = {
        id: 'number',
    };

    if(validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL DeleteUser(?)", [data.id], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse("Internal Server Error"));
        }
    );
});

/* Jahrgang bearbeiten Request */
router.put('/', function (req, res) {
    const data = req.body;
    const expected = {
        userId: 'number',
        userYear: 'number'
    };
    if (validateBody(data, expected, res)) {
        return;
    }
    if(data.userYear > 5 || data.userYear < 1) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: userYear. Must be between 1 and 5."));
    }

    executeQuery("CALL UpdateUser(?, ?)", [data.userId, data.userYear], res,
        (result) => {
            const user = result[0][0];
            if (!user) {
                res.status(404).json(createErrorResponse("User not found"));
            } else {
                res.status(200).json(createSuccessResponse({user: user}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Jahrgang eines Users bekommen */
router.get('/year', function (req, res) {
    const data = req.query
    const expected = {
        id: 'number',
    };
    if(validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetUserYear(?)", [data.id], res,
        (result) => {
            const user = result[0][0];
            if (!user) {
                res.status(404).json(createErrorResponse("User not found"));
            } else {
                res.status(200).json(createSuccessResponse({user: user}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* Alle User (aus einem Jahrgang) holen */
router.get('/', function (req, res) {
    const data = req.query;
    const expected = {
        year: 'optional number'
    };
    if(validateQuery(data, expected, res)) {
        return;
    }

    if(data.year > 5 || data.year < 1) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: year. Must be between 1 and 5."));
    }

    executeQuery("CALL GetUsers(?)", [data.year], res,
        (result) => {
            const response = {
                users: result[0]
            };
            res.status(200).json(createSuccessResponse(response));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* User bereits registriert */
router.get('/check', function (req, res) {
    const data = req.query;
    const expected = {
        name: 'string'
    };
    if(validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL CheckUser(?)", [data.name], res,
        (result) => {
            res.status(200).json(createSuccessResponse({registered: result[0][0].userRegistered === 1}));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

module.exports = router;
