var express = require('express');
var router = express.Router();
const {executeQuery} = require("../config/database");
const {
    validateBody,
    validateQuery,
    validateKey
} = require("../config/validator");
const {createErrorResponse, createSuccessResponse} = require("../config/response");

/* User hinzufügen */
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
        (result) =>  {
            if (result[0][0] && result[0][0].result == "404") {
                res.status(404).json(createErrorResponse("User was not found."));
            } else {
                const friendship = result[0][0];
                friendship.friendshipPending = Boolean(friendship.friendshipPending);
                res.status(200).json(createSuccessResponse({friendship: friendship}));
            }
        },
        (error) => {
            console.error(error)
            res.status(500).json(createErrorResponse('Internal Server Error'));
        }
    );
});


module.exports = router;
