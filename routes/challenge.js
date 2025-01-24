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

/* Challenge hinzufügen (Schwerpunkt )*/
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

module.exports = router;
