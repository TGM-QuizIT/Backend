var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/*TODO: User Objekt und nicht nur Ids in Response */

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
                friendship.friendshipPending = Boolean(friendship.friendshipPending);
                res.status(201).json(createSuccessResponse({friendship: friendship}));
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
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
            res.status(500).json(createErrorResponse("Internal Server Error"));
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
                friendship.friendshipPending = Boolean(friendship.friendshipPending);
                res.status(200).json(createSuccessResponse({friendship: friendship}));
            }
        },
        (error) => {
            res.status(500).json(createErrorResponse("Internal Server Error"));
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
                    userId: data.id,
                    acceptedFriendships: [],
                    pendingFriendships: []
                })
                friendships.forEach(friendship => {
                    if (friendship.friendshipPending === 0) {
                        resp.acceptedFriendships.push({
                            friendshipId: friendship.friendshipId,
                            friendId: friendship.user1Id === data.id ? friendship.user1Id : friendship.user2Id,
                            friendshipSince: friendship.friendshipSince
                        });
                    } else if (friendship.friendshipPending === 1) {
                        resp.pendingFriendships.push({
                            friendshipId: friendship.friendshipId,
                            friendId: friendship.user1Id === data.id ? friendship.user1Id : friendship.user2Id
                        });
                    }
                });
                res.status(200).json(resp);
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse("Internal Server Error"));
        }
    );
});

module.exports = router;
