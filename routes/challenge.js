var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey,
    formatError
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Challenge hinzufügen (Schwerpunkt)*/
router.post('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        friendshipId: 'number',
        focusId: 'number',
        userId: 'number',
    };

    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL InsertChallenge(?, ?, ?, ?)", [data.friendshipId, data.focusId, null, data.userId], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("Friendship was not found."));
            } else if (result[0][0] && result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("Focus was not found."));
            } else {
                const challenge = result[0][0];
                const resChallenge = {
                    challengeId: challenge.challengeId,
                    challengeDateTime: challenge.challengeDateTime,
                    friendship: {
                        friendshipId: challenge.friendshipId,
                        friend: {
                            userId: challenge.userId,
                            userName: challenge.userName,
                            userYear: challenge.userYear,
                            userFullname: challenge.userFullname,
                            userClass: challenge.userClass,
                            userType: challenge.userType,
                            userMail: challenge.userMail,
                            userBlocked: challenge.userBlocked === 1,
                        },
                        friendshipPending: challenge.friendshipPending === 1,
                        friendshipSince: challenge.friendshipSince,
                        actionReq: false
                    },
                    focus: {
                        focusId: challenge.focusId,
                        focusName: challenge.focusName,
                        focusYear: challenge.focusYear,
                        focusImageAddress: challenge.focusImageAddress,
                        questionCount: challenge.questionCount
                    }
                }
                res.status(201).json(createSuccessResponse({challenge: resChallenge}));
            }
        },
        (error) => {
            console.log(error)
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Challenge hinzufügen (Fach)*/
router.post('/subject', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        friendshipId: 'number',
        subjectId: 'number',
        userId: 'number',
    };

    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL InsertChallenge(?, ?, ?, ?)", [data.friendshipId, null, data.subjectId, data.userId], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("Friendship was not found."));
            } else if (result[0][0] && result[0][0].result == "404-3") {
                res.status(404).json(createErrorResponse("Subject was not found."));
            } else {
                const challenge = result[0][0];
                const resChallenge = {
                    challengeId: challenge.challengeId,
                    challengeDateTime: challenge.challengeDateTime,
                    friendship: {
                        friendshipId: challenge.friendshipId,
                        friend: {
                            userId: challenge.userId,
                            userName: challenge.userName,
                            userYear: challenge.userYear,
                            userFullname: challenge.userFullname,
                            userClass: challenge.userClass,
                            userType: challenge.userType,
                            userMail: challenge.userMail,
                            userBlocked: challenge.userBlocked === 1,
                        },
                        friendshipPending: challenge.friendshipPending === 1,
                        friendshipSince: challenge.friendshipSince,
                        actionReq: false
                    },
                    subject: {
                        subjectId: challenge.subjectId,
                        subjectName: challenge.subjectName,
                        subjectImageAddress: challenge.subjectImageAddress,
                    }
                }
                res.status(201).json(createSuccessResponse({challenge: resChallenge}));
            }
        },
        (error) => {
            console.log(error)
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Challenge löschen */
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

    executeQuery("CALL DeleteChallenge(?)", [data.id], res,
        (result) => {
            if (result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Challenge not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Resultat zu einer Challenge zuweisen */
router.put('/', function(req,res) {
    if (!validateKey(req,res)) {
        return;
    }
    const data = req.body;
    const expected = {
        challengeId: 'number',
        resultId: 'number'
    };
    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL AssignResultToChallenge(?,?)", [data.challengeId, data.resultId], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("Challenge was not found."));
            } else if (result[0][0] && result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("Result was not found."));
            } else if (result[0][0] && result[0][0].result == "400") {
                res.status(404).json(createErrorResponse("Result is not valid for this challenge."));
            } else {
                const challenge = result[0][0];
                var resChallenge = {}
                if (challenge.focusId) {
                    resChallenge = {
                        challengeId: challenge.challengeId,
                        challengeDateTime: challenge.challengeDateTime,
                        friendship: {
                            friendshipId: challenge.friendshipId,
                            friend: {
                                userId: challenge.userId,
                                userName: challenge.userName,
                                userYear: challenge.userYear,
                                userFullname: challenge.userFullname,
                                userClass: challenge.userClass,
                                userType: challenge.userType,
                                userMail: challenge.userMail,
                                userBlocked: challenge.userBlocked === 1,
                            },
                            friendshipPending: false,
                            friendshipSince: challenge.friendshipSince,
                            actionReq: false
                        },
                        focus: {
                            focusId: challenge.focusId,
                            focusName: challenge.focusName,
                            focusYear: challenge.focusYear,
                            focusImageAddress: challenge.focusImageAddress,
                            questionCount: challenge.questionCount
                        },
                        friendScore: {
                            resultId: challenge.resultId,
                            resultScore: challenge.resultScore,
                            userId: challenge.userId,
                            focus: {
                                focusId: challenge.focusId,
                                focusName: challenge.focusName,
                                focusYear: challenge.focusYear,
                                focusImageAddress: challenge.focusImageAddress,
                                questionCount: challenge.questionCount
                            },
                            resultDateTime: challenge.resultDateTime
                        }
                    }
                }
                else {
                    resChallenge = {
                        challengeId: challenge.challengeId,
                        challengeDateTime: challenge.challengeDateTime,
                        friendship: {
                            friendshipId: challenge.friendshipId,
                            friend: {
                                userId: challenge.userId,
                                userName: challenge.userName,
                                userYear: challenge.userYear,
                                userFullname: challenge.userFullname,
                                userClass: challenge.userClass,
                                userType: challenge.userType,
                                userMail: challenge.userMail,
                                userBlocked: challenge.userBlocked === 1,
                            },
                            friendshipPending: false,
                            friendshipSince: challenge.friendshipSince,
                            actionReq: false
                        },
                        subject: {
                            subjectId: challenge.subjectId,
                            subjectName: challenge.subjectName,
                            subjectImageAddress: challenge.subjectImageAddress,
                        },
                        friendScore: {
                            resultId: challenge.resultId,
                            resultScore: challenge.resultScore,
                            userId: challenge.userId,
                            subject: {
                                subjectId: challenge.subjectId,
                                subjectName: challenge.subjectName,
                                subjectImageAddress: challenge.subjectImageAddress,
                            },
                            resultDateTime: challenge.resultDateTime
                        }
                    }
                }
                res.status(200).json(createSuccessResponse({challenge: resChallenge}));
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Alle Challenges zu einer Freundschaft holen */
router.get('/friendship', function(req,res) {
    if (!validateKey(req,res)) {
        return;
    }
    const data = req.query;
    const expected = {
        friendshipId: 'number',
        userId: 'number'
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetFriendshipChallenges(?,?)", [data.friendshipId, data.userId], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Friendship was not found."));
            } else {
                const challenges = result[0];
                var resDoneChallenges = [];
                var resOpenChallenges = [];
                challenges.forEach(challenge => {
                    var resChallenge = {};
                    if (challenge.focusId) {
                        resChallenge = {
                            challengeId: challenge.challengeId,
                            challengeDateTime: challenge.challengeDateTime,
                            friendship: {
                                friendshipId: challenge.friendshipId,
                                friend: {
                                    userId: challenge.userId,
                                    userName: challenge.userName,
                                    userYear: challenge.userYear,
                                    userFullname: challenge.userFullname,
                                    userClass: challenge.userClass,
                                    userType: challenge.userType,
                                    userMail: challenge.userMail,
                                    userBlocked: challenge.userBlocked === 1,
                                },
                                friendshipPending: false,
                                friendshipSince: challenge.friendshipSince,
                                actionReq: false
                            },
                            focus: {
                                focusId: challenge.focusId,
                                focusName: challenge.focusName,
                                focusYear: challenge.focusYear,
                                focusImageAddress: challenge.focusImageAddress,
                                questionCount: challenge.questionCount
                            },
                            score: challenge.resultId !== null ? {
                                resultId: challenge.resultId,
                                resultScore: challenge.resultScore,
                                userId: +data.userId,
                                focus: {
                                    focusId: challenge.focusId,
                                    focusName: challenge.focusName,
                                    focusYear: challenge.focusYear,
                                    focusImageAddress: challenge.focusImageAddress,
                                    questionCount: challenge.questionCount
                                },
                                resultDateTime: challenge.resultDateTime
                            } : null,
                            friendScore: challenge.friendResultId !== null ?{
                                resultId: challenge.friendResultId,
                                resultScore: challenge.friendResultScore,
                                userId: challenge.userId,
                                focus: {
                                    focusId: challenge.focusId,
                                    focusName: challenge.focusName,
                                    focusYear: challenge.focusYear,
                                    focusImageAddress: challenge.focusImageAddress,
                                    questionCount: challenge.questionCount
                                },
                                resultDateTime: challenge.friendResultDateTime
                            } : null
                        }
                    }
                    else {
                        resChallenge = {
                            challengeId: challenge.challengeId,
                            challengeDateTime: challenge.challengeDateTime,
                            friendship: {
                                friendshipId: challenge.friendshipId,
                                friend: {
                                    userId: challenge.userId,
                                    userName: challenge.userName,
                                    userYear: challenge.userYear,
                                    userFullname: challenge.userFullname,
                                    userClass: challenge.userClass,
                                    userType: challenge.userType,
                                    userMail: challenge.userMail,
                                    userBlocked: challenge.userBlocked === 1,
                                },
                                friendshipPending: false,
                                friendshipSince: challenge.friendshipSince,
                                actionReq: false
                            },
                            subject: {
                                subjectId: challenge.subjectId,
                                subjectName: challenge.subjectName,
                                subjectImageAddress: challenge.subjectImageAddress,
                            },
                            score: challenge.resultId !== null ? {
                                resultId: challenge.resultId,
                                resultScore: challenge.resultScore,
                                userId: +data.userId,
                                subject: {
                                    subjectId: challenge.subjectId,
                                    subjectName: challenge.subjectName,
                                    subjectImageAddress: challenge.subjectImageAddress,
                                },
                                resultDateTime: challenge.resultDateTime
                            } : null,
                            friendScore: challenge.friendResultId !== null ? {
                                resultId: challenge.friendResultId,
                                resultScore: challenge.friendResultScore,
                                userId: challenge.userId,
                                subject: {
                                    subjectId: challenge.subjectId,
                                    subjectName: challenge.subjectName,
                                    subjectImageAddress: challenge.subjectImageAddress,
                                },
                                resultDateTime: challenge.friendResultDateTime
                            } : null
                        }
                    }
                    if (resChallenge.score && resChallenge.friendScore) {
                        resDoneChallenges.push(resChallenge)
                    } else {
                        resOpenChallenges.push(resChallenge)
                    }
                });

                res.status(200).json(createSuccessResponse({openChallenges: resOpenChallenges, doneChallenges: resDoneChallenges}));
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Alle Challenges eines Users zu einem Fach holen */
router.get('/', function(req,res) {
    if (!validateKey(req,res)) {
        return;
    }
    const data = req.query;
    const expected = {
        subjectId: 'number',
        userId: 'number'
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetSubjectChallengesOfUser(?,?)", [data.subjectId, data.userId], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404-1") {
                res.status(404).json(createErrorResponse("Subject was not found."));
            } else if (result[0][0] && result[0][0].result == "404-2") {
                res.status(404).json(createErrorResponse("User was not found."));
            } else {
                const challenges = result[0];
                var resDoneChallenges = [];
                var resOpenChallenges = [];
                challenges.forEach(challenge => {
                    var resChallenge = {};
                    if (challenge.focusId) {
                        resChallenge = {
                            challengeId: challenge.challengeId,
                            challengeDateTime: challenge.challengeDateTime,
                            friendship: {
                                friendshipId: challenge.friendshipId,
                                friend: {
                                    userId: challenge.userId,
                                    userName: challenge.userName,
                                    userYear: challenge.userYear,
                                    userFullname: challenge.userFullname,
                                    userClass: challenge.userClass,
                                    userType: challenge.userType,
                                    userMail: challenge.userMail,
                                    userBlocked: challenge.userBlocked === 1,
                                },
                                friendshipPending: false,
                                friendshipSince: challenge.friendshipSince,
                                actionReq: false
                            },
                            focus: {
                                focusId: challenge.focusId,
                                focusName: challenge.focusName,
                                focusYear: challenge.focusYear,
                                focusImageAddress: challenge.focusImageAddress,
                                questionCount: challenge.questionCount
                            },
                            score: challenge.resultId !== null ? {
                                resultId: challenge.resultId,
                                resultScore: challenge.resultScore,
                                userId: +data.userId,
                                focus: {
                                    focusId: challenge.focusId,
                                    focusName: challenge.focusName,
                                    focusYear: challenge.focusYear,
                                    focusImageAddress: challenge.focusImageAddress,
                                    questionCount: challenge.questionCount
                                },
                                resultDateTime: challenge.resultDateTime
                            } : null,
                            friendScore: challenge.friendResultId !== null ?{
                                resultId: challenge.friendResultId,
                                resultScore: challenge.friendResultScore,
                                userId: challenge.userId,
                                focus: {
                                    focusId: challenge.focusId,
                                    focusName: challenge.focusName,
                                    focusYear: challenge.focusYear,
                                    focusImageAddress: challenge.focusImageAddress,
                                    questionCount: challenge.questionCount
                                },
                                resultDateTime: challenge.friendResultDateTime
                            } : null
                        }
                    }
                    else {
                        resChallenge = {
                            challengeId: challenge.challengeId,
                            challengeDateTime: challenge.challengeDateTime,
                            friendship: {
                                friendshipId: challenge.friendshipId,
                                friend: {
                                    userId: challenge.userId,
                                    userName: challenge.userName,
                                    userYear: challenge.userYear,
                                    userFullname: challenge.userFullname,
                                    userClass: challenge.userClass,
                                    userType: challenge.userType,
                                    userMail: challenge.userMail,
                                    userBlocked: challenge.userBlocked === 1,
                                },
                                friendshipPending: false,
                                friendshipSince: challenge.friendshipSince,
                                actionReq: false
                            },
                            subject: {
                                subjectId: challenge.subjectId,
                                subjectName: challenge.subjectName,
                                subjectImageAddress: challenge.subjectImageAddress,
                            },
                            score: challenge.resultId !== null ? {
                                resultId: challenge.resultId,
                                resultScore: challenge.resultScore,
                                userId: +data.userId,
                                subject: {
                                    subjectId: challenge.subjectId,
                                    subjectName: challenge.subjectName,
                                    subjectImageAddress: challenge.subjectImageAddress,
                                },
                                resultDateTime: challenge.resultDateTime
                            } : null,
                            friendScore: challenge.friendResultId !== null ? {
                                resultId: challenge.friendResultId,
                                resultScore: challenge.friendResultScore,
                                userId: challenge.userId,
                                subject: {
                                    subjectId: challenge.subjectId,
                                    subjectName: challenge.subjectName,
                                    subjectImageAddress: challenge.subjectImageAddress,
                                },
                                resultDateTime: challenge.friendResultDateTime
                            } : null
                        }
                    }
                    if (resChallenge.score && resChallenge.friendScore) {
                        resDoneChallenges.push(resChallenge)
                    } else {
                        resOpenChallenges.push(resChallenge)
                    }
                });

                res.status(200).json(createSuccessResponse({openChallenges: resOpenChallenges, doneChallenges: resDoneChallenges}));
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Alle abgeschlossenen Challenges eines Users holen */
router.get('/done', function(req,res) {
    if (!validateKey(req,res)) {
        return;
    }
    const data = req.query;
    const expected = {
        userId: 'number'
    };
    if (validateQuery(data, expected, res)) {
        return;
    }

    executeQuery("CALL GetDoneChallenges(?)", [data.userId], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User was not found."));
            } else {
                const challenges = result[0];
                var resDoneChallenges = [];
                challenges.forEach(challenge => {
                    var resChallenge = {};
                    if (challenge.focusId) {
                        resChallenge = {
                            challengeId: challenge.challengeId,
                            challengeDateTime: challenge.challengeDateTime,
                            friendship: {
                                friendshipId: challenge.friendshipId,
                                friend: {
                                    userId: challenge.userId,
                                    userName: challenge.userName,
                                    userYear: challenge.userYear,
                                    userFullname: challenge.userFullname,
                                    userClass: challenge.userClass,
                                    userType: challenge.userType,
                                    userMail: challenge.userMail,
                                    userBlocked: challenge.userBlocked === 1,
                                },
                                friendshipPending: false,
                                friendshipSince: challenge.friendshipSince,
                                actionReq: false
                            },
                            focus: {
                                focusId: challenge.focusId,
                                focusName: challenge.focusName,
                                focusYear: challenge.focusYear,
                                focusImageAddress: challenge.focusImageAddress,
                                questionCount: challenge.questionCount
                            },
                            score: challenge.resultId !== null ? {
                                resultId: challenge.resultId,
                                resultScore: challenge.resultScore,
                                userId: +data.userId,
                                focus: {
                                    focusId: challenge.focusId,
                                    focusName: challenge.focusName,
                                    focusYear: challenge.focusYear,
                                    focusImageAddress: challenge.focusImageAddress,
                                    questionCount: challenge.questionCount
                                },
                                resultDateTime: challenge.resultDateTime
                            } : null,
                            friendScore: challenge.friendResultId !== null ?{
                                resultId: challenge.friendResultId,
                                resultScore: challenge.friendResultScore,
                                userId: challenge.userId,
                                focus: {
                                    focusId: challenge.focusId,
                                    focusName: challenge.focusName,
                                    focusYear: challenge.focusYear,
                                    focusImageAddress: challenge.focusImageAddress,
                                    questionCount: challenge.questionCount
                                },
                                resultDateTime: challenge.friendResultDateTime
                            } : null
                        }
                    }
                    else {
                        resChallenge = {
                            challengeId: challenge.challengeId,
                            challengeDateTime: challenge.challengeDateTime,
                            friendship: {
                                friendshipId: challenge.friendshipId,
                                friend: {
                                    userId: challenge.userId,
                                    userName: challenge.userName,
                                    userYear: challenge.userYear,
                                    userFullname: challenge.userFullname,
                                    userClass: challenge.userClass,
                                    userType: challenge.userType,
                                    userMail: challenge.userMail,
                                    userBlocked: challenge.userBlocked === 1,
                                },
                                friendshipPending: false,
                                friendshipSince: challenge.friendshipSince,
                                actionReq: false
                            },
                            subject: {
                                subjectId: challenge.subjectId,
                                subjectName: challenge.subjectName,
                                subjectImageAddress: challenge.subjectImageAddress,
                            },
                            score: challenge.resultId !== null ? {
                                resultId: challenge.resultId,
                                resultScore: challenge.resultScore,
                                userId: +data.userId,
                                subject: {
                                    subjectId: challenge.subjectId,
                                    subjectName: challenge.subjectName,
                                    subjectImageAddress: challenge.subjectImageAddress,
                                },
                                resultDateTime: challenge.resultDateTime
                            } : null,
                            friendScore: challenge.friendResultId !== null ? {
                                resultId: challenge.friendResultId,
                                resultScore: challenge.friendResultScore,
                                userId: challenge.userId,
                                subject: {
                                    subjectId: challenge.subjectId,
                                    subjectName: challenge.subjectName,
                                    subjectImageAddress: challenge.subjectImageAddress,
                                },
                                resultDateTime: challenge.friendResultDateTime
                            } : null
                        }
                    }
                    resDoneChallenges.push(resChallenge)
                });

                res.status(200).json(createSuccessResponse({doneChallenges: resDoneChallenges}));
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

module.exports = router;
