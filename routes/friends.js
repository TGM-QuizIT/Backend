var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey, formatError
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* Freundschaft hinzufügen */
router.post('/', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        user1Id: 'number',
        user2Id: 'number'
    };

    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL InsertFriendship(?, ?)", [data.user1Id, data.user2Id], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User was not found."));
            } else {
                const friendship = result[0][0];
                const resFriendship = {
                    friendshipId: friendship.friendshipId,
                    user1: {
                        userId: friendship.user1Id,
                        userName: friendship.user1Name,
                        userYear: friendship.user1Year,
                        userFullname: friendship.user1Fullname,
                        userClass: friendship.user1Class,
                        userType: friendship.user1Type,
                        userMail: friendship.user1Mail,
                    },
                    user2: {
                        userId: friendship.user2Id,
                        userName: friendship.user2Name,
                        userYear: friendship.user2Year,
                        userFullname: friendship.user2Fullname,
                        userClass: friendship.user2Class,
                        userType: friendship.user2Type,
                        userMail: friendship.user2Mail,
                    },
                    friendshipPending: friendship.friendshipPending === 1
                }
                res.status(201).json(createSuccessResponse({friendship: resFriendship}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Freundschaft löschen */
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

    executeQuery("CALL DeleteFriendship(?)", [data.id], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("Friendship not found"));
            } else {
                res.status(200).json(createSuccessResponse());
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Freundschaft annehmen */
router.put('/accept', function (req, res) {
    if (!validateKey(req, res)) {
        return;
    }
    const data = req.body;
    const expected = {
        id: 'number',
    };

    if (validateBody(data, expected, res)) {
        return;
    }

    executeQuery("CALL AcceptFriendship(?)", [data.id], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User was not found."));
            } else {
                const friendship = result[0][0];
                const resFriendship = {
                    friendshipId: friendship.friendshipId,
                    user1: {
                        userId: friendship.user1Id,
                        userName: friendship.user1Name,
                        userYear: friendship.user1Year,
                        userFullname: friendship.user1Fullname,
                        userClass: friendship.user1Class,
                        userType: friendship.user1Type,
                        userMail: friendship.user1Mail,
                    },
                    user2: {
                        userId: friendship.user2Id,
                        userName: friendship.user2Name,
                        userYear: friendship.user2Year,
                        userFullname: friendship.user2Fullname,
                        userClass: friendship.user2Class,
                        userType: friendship.user2Type,
                        userMail: friendship.user2Mail,
                    },
                    friendshipPending: friendship.friendshipPending === 1
                }
                res.status(200).json(createSuccessResponse({friendship: resFriendship}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

/* Alle Freundschaften eines Users holen */
router.get('/', function (req, res) {
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

    executeQuery("CALL GetUsersFriendships(?)", [data.id], res,
        (result) => {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User was not found."));
            } else {
                const friendships = result[0];
                const resp = createSuccessResponse({
                    userId: parseInt(data.id),
                    acceptedFriendships: [],
                    pendingFriendships: []
                })
                friendships.forEach(friendship => {
                    if (friendship.friendshipPending === 0) {
                        resp.acceptedFriendships.push({
                            friendshipId: friendship.friendshipId,
                            friend: {
                                userId: friendship.userId,
                                userName: friendship.userName,
                                userYear: friendship.userYear,
                                userFullname: friendship.userFullname,
                                userClass: friendship.userClass,
                                userType: friendship.userType,
                                userMail: friendship.userMail
                            },
                            friendshipSince: friendship.friendshipSince
                        });
                    } else if (friendship.friendshipPending === 1) {
                        resp.pendingFriendships.push({
                            friendshipId: friendship.friendshipId,
                            friend: {
                                userId: friendship.userId,
                                userName: friendship.userName,
                                userYear: friendship.userYear,
                                userFullname: friendship.userFullname,
                                userClass: friendship.userClass,
                                userType: friendship.userType,
                                userMail: friendship.userMail
                            },
                            actionReq: friendship.actionReq === 1
                        });
                    }
                });
                res.status(200).json(resp);
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse('Internal Server Error', formatError(error)));
        }
    );
});

module.exports = router;
