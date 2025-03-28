var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    formatError
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");
const {createLDAPRequest} = require("../config/ldap");


/* User hinzufügen */
router.post('/', function (req, res) {
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
            user.userBlocked = user.userBlocked === 1;
            res.status(201).json(createSuccessResponse({user: user}));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* User löschen */
router.delete('/', function (req, res) {
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
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
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
    if (data.userYear > 5 || data.userYear < 1) {
        return res.status(422).json(createErrorResponse("Invalid range for parameter: userYear. Must be between 1 and 5."));
    }

    executeQuery("CALL UpdateUserYear(?, ?)", [data.userId, data.userYear], res,
        (result) => {
            const user = result[0][0];
            if (!user) {
                res.status(404).json(createErrorResponse("User not found"));
            } else {
                user.userBlocked = user.userBlocked === 1;
                res.status(200).json(createSuccessResponse({user: user}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Jahrgang eines Users bekommen */
router.get('/year', function (req, res) {
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
                user.userBlocked = user.userBlocked === 1;
                res.status(200).json(createSuccessResponse({user: user}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Alle User (aus einem Jahrgang) holen */
router.get('/', function (req, res) {
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

            const users = result[0];
            if (users.length > 0) {
                users.forEach(user => {
                    user.userBlocked = user.userBlocked === 1;
                });
            }

            const response = {
                users: users
            };
            res.status(200).json(createSuccessResponse(response));
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* User bereits registriert */
router.get('/check', function (req, res) {
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
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* User Login */
router.post('/login', function (req, res) {
    const data = req.body;
    const expected = {
        userName: 'string',
        password: 'string'
    };

    if (validateBody(data, expected, res)) {
        return;
    }
    if (data.userName == 'appleDev' && data.password == process.env.APPLE_PASSWORD) {
        const user = {
            userId: 11,
            userName: "appleDev",
            userYear: 4,
            userFullname: "Apple Developer",
            userClass: "5AHIT",
            userType: "schueler",
            userMail: "developer@icloud.com",
            userBlocked: false
        }
        res.status(200).json(createSuccessResponse({user: user}));
        return
    }
    else if (data.userName == 'teacher1' && data.password == process.env.FIRST_PASSWORD) {
        const user = {
            userId: 1,
            userName: "teacher1",
            userYear: 4,
            userFullname: "Teacher 1",
            userClass: "3XHIT",
            userType: "schueler",
            userMail: "teacher1@tgm.ac.at",
            userBlocked: false
        }
        res.status(200).json(createSuccessResponse({user: user}));
        return
    }
    else if (data.userName == 'teacher2' && data.password == process.env.SECOND_PASSWORD) {
        const user = {
            userId: 2,
            userName: "teacher2",
            userYear: 4,
            userFullname: "Teacher 2",
            userClass: "3XHIT",
            userType: "schueler",
            userMail: "teacher2@tgm.ac.at",
            userBlocked: false
        }
        res.status(200).json(createSuccessResponse({user: user}));
        return
    }
    else if (data.userName == 'teacher3' && data.password == process.env.THIRD_PASSWORD) {
        const user = {
            userId: 3,
            userName: "teacher3",
            userYear: 4,
            userFullname: "Teacher 3",
            userClass: "3XHIT",
            userType: "schueler",
            userMail: "teacher3@tgm.ac.at",
            userBlocked: false
        }
        res.status(200).json(createSuccessResponse({user: user}));
        return
    }
    else if (data.userName == 'teacher4' && data.password == process.env.FOURTH_PASSWORD) {
        const user = {
            userId: 4,
            userName: "teacher4",
            userYear: 4,
            userFullname: "Teacher 4",
            userClass: "3XHIT",
            userType: "schueler",
            userMail: "teacher4@tgm.ac.at",
            userBlocked: false
        }
        res.status(200).json(createSuccessResponse({user: user}));
        return
    }
    else if (data.userName == 'teacher5' && data.password == process.env.FIFTH_PASSWORD) {
        const user = {
            userId: 5,
            userName: "teacher5",
            userYear: 4,
            userFullname: "Teacher 5",
            userClass: "3XHIT",
            userType: "schueler",
            userMail: "teacher5@tgm.ac.at",
            userBlocked: false
        }
        res.status(200).json(createSuccessResponse({user: user}));
        return
    }

    createLDAPRequest(data.userName, data.password, res,
        (result) => {
            executeQuery("SELECT userId FROM user WHERE userName = ?", [data.userName], res,
                (otherResult) => {
                    if (otherResult[0] === undefined) {
                        const userName = result.mailNickname[0];
                        const userFullname = result.name[0];
                        const userType = result.employeeType[0];
                        const userClass = result.employeeType[0] !== "schueler" ? "Teacher" : result.department[0];
                        const userMail = result.mail[0]

                        executeQuery("CALL InsertUser(?, ?, ?, ?, ?, ?)", [userName, parseInt(userClass.charAt(0)), userFullname, userClass, userType, userMail], res,
                            (thirdResult) => {
                                const user = thirdResult[0][0];
                                user.userBlocked = user.userBlocked === 1;
                                res.status(200).json(createSuccessResponse({user: user}));
                            },
                            (thirdError) => {
                                res.status(500).json(createErrorResponse('Internal Server Error', formatError(thirdError)));
                            }
                        );
                    } else {
                        const userClass = result.employeeType[0] !== "schueler" ? "Teacher" : result.department[0];
                        executeQuery("CALL UpdateUser(?, ?)", [otherResult[0].userId, userClass], res,
                            (thirdResult) => {
                                const user = thirdResult[0][0];
                                if (!user) {
                                    res.status(404).json(createErrorResponse("User not found"));
                                } else {
                                    user.userBlocked = user.userBlocked === 1;
                                    res.status(200).json(createSuccessResponse({user: user}));
                                }
                            },
                            (thirdError) => {
                                res.status(500).json(createErrorResponse('Internal Server Error'));
                            }
                        );
                    }
                },
                (otherError) => {
                    res.status(500).json(createErrorResponse('Internal Server Error', formatError(otherError)));
                }
            );
        },
        (error) => {
            if (error == "InvalidCredentialsError") {
                res.status(401).json(createErrorResponse("Invalid Credentials"))
            } else {
                res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
            }
        }
    );
});

/* User blocken */
router.put('/block', function (req, res) {
    const data = req.body;
    const expected = {
        userId: 'number',
        userBlocked: 'boolean'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL UpdateUserBlocked(?, ?)", [data.userId, data.userBlocked], res,
        (result) => {
            const user = result[0][0];
            if (!user) {
                res.status(404).json(createErrorResponse("User not found"));
            } else {
                user.userBlocked = user.userBlocked === 1;
                res.status(200).json(createSuccessResponse({user: user}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Stats eines Users holen */
router.get('/stats', function(req,res) {
    const data = req.query;
    const expected = {
        id: 'number'
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL CalculateUsersStats(?)", [data.id], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User was not found."));
            } else {
                res.status(200).json(createSuccessResponse({stats: result[0][0]}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Überprüfung, ob ein User blockiert ist */
router.get('/blocked', function (req, res) {
    const data = req.query
    const expected = {
        id: 'number',
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("SELECT * FROM user WHERE userId = ?;", [data.id], res,
        (result) => {
            const user = result[0];
            if (!user) {
                res.status(404).json(createErrorResponse("User not found"));
            } else {
                res.status(200).json(createSuccessResponse({blocked: user.userBlocked === 1}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

module.exports = router;
