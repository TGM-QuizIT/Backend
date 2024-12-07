var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");
const {createLDAPRequest} = require("../config/ldap");


/* User hinzufügen */
router.post('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        userName: 'string',
        userFullname: 'string',
        userClass: 'string',
        userType: 'string',
        userMail: 'string'
    };

    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL InsertUser(?, ?, ?, ?, ?, ?)", [data.userName, parseInt(data.userClass.charAt(0)), data.userFullname, data.userClass, data.userType, data.userMail], res,
        (result) => {
            const user = result[0][0];
            res.status(201).json(createSuccessResponse({user: user}));
        },
        (thirdError) => {
            console.error(thirdError)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});

/* User löschen */
router.delete('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.query;
    const expected = {
        id: 'number',
    };

    if (validateQuery(data, expected, res)) {
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
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        userId: 'number',
        userYear: 'number',
        userClass: 'string'
    };
    if (validateBody(data, expected, res)) {
        return;
    }
    if (data.userYear > 5 || data.userYear < 1) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: userYear. Must be between 1 and 5."));
    }

    executeQuery("CALL UpdateUser(?, ?, ?)", [data.userId, data.userYear, data.userClass], res,
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
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.query
    const expected = {
        id: 'number',
    };
    if (validateQuery(data, expected, res)) {
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
    if (!validateKey(req, res)) {
        return;
    }

    const data = req.query;
    const expected = {
        year: 'optional number'
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    if (data.year > 5 || data.year < 1) {
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
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.query;
    const expected = {
        name: 'string'
    };
    if (validateQuery(data, expected, res)) {
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

/* User Login */
router.post('/login', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        userName: 'string',
        password: 'string'
    };

    if (validateBody(data, expected, res)) {
        return;
    }

    createLDAPRequest(data.userName, data.password, res,
        (result) => {
            executeQuery("SELECT userId FROM user WHERE userName = ?", [data.userName], res,
                (otherResult) => {
                    if (otherResult[0] === undefined) {
                        const userName = result.mailNickname[0];
                        const userFullname = result.name[0];
                        const userClass = result.department[0];
                        const userType = result.employeeType[0];
                        const userMail = result.mail[0]

                        executeQuery("CALL InsertUser(?, ?, ?, ?, ?, ?)", [userName, parseInt(userClass.charAt(0)), userFullname, userClass, userType, userMail], res,
                            (thirdResult) => {
                                const user = thirdResult[0][0];
                                res.status(200).json(createSuccessResponse({user: user}));
                            },
                            (thirdError) => {
                                console.error(thirdError)
                                res.status(500).json(createErrorResponse('Internal Server Error'));
                            }
                        );
                    } else {
                        const userClass = result.department[0];
                        executeQuery("CALL UpdateUser(?, ?, ?)", [otherResult[0].userId, userClass.charAt(0), userClass], res,
                            (thirdResult) => {
                                const user = thirdResult[0][0];
                                if (!user) {
                                    res.status(404).json(createErrorResponse("User not found"));
                                } else {
                                    res.status(200).json(createSuccessResponse({user: user}));
                                }
                            },
                            (thirdError) => {
                                console.error(thirdError)
                                res.status(500).json(createErrorResponse('Internal Server Error'));
                            }
                        );
                    }
                },
                (otherError) => {
                    console.error(otherError)
                    res.status(500).json(createErrorResponse('Internal Server Error'));
                }
            );
        },
        (error) => {
            if (error == "InvalidCredentialsError") {
                res.status(401).json(createErrorResponse("Invalid Credentials"))
            } else {
                console.error(error)
                res.status(500).json(createErrorResponse("Internal Server Error"))
            }
        }
    );
});

module.exports = router;
