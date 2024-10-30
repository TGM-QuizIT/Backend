var express = require('express');
var router = express.Router();
const { executeQuery } = require("../config/database");
const { validateParams, validateString, validateInt, validateBoolean } = require("../config/validator");
const { createErrorResponse, createSuccessResponse } = require("../config/response");



/* User hinzufügen */
router.post('/', function(req, res)   {
  const data = req.body;

  // Check, if all necessary parameters are there
  const missingParam = validateParams(data, ["userName", "userYear"], res);
  if (missingParam) {
    return res.status(400).json(createErrorResponse(`Missing parameter: ${missingParam}`));
  }

  /* Check, if parameters are of the correct type */
  if (!validateString(data.userName)) {
    return res.status(422).json(createErrorResponse('Invalid type for parameter: userName. Expected string.'));
  }
  if (!validateInt(data.userYear)) {
    return res.status(422).json(createErrorResponse('Invalid type for parameter: userYear. Expected integer.'));
  }

  executeQuery("CALL InsertUser(?,?)", [data.userName, data.userYear], res, (result) => {
    res.status(201).json(createSuccessResponse({ user: result[0][0] }));
  });
});

/* User löschen */
router.delete('/', function(req, res) {

  //Check, if mandatory parameter is present
  if(!req.query.id) {
    return res.status(400).json(createErrorResponse("Missing parameter: id"));
  }

  const id = parseInt(req.query.id, 10);

  /* Check, if parameter is the correct type */
  if (!validateInt(id)) {
    return res.status(422).json(createErrorResponse("Invalid type for parameter: id. Expected integer."));
  }

  executeQuery("CALL DeleteUser(?)", [id], res, (result) => {
    const affectedRows = result[0][0].affectedRows;
    if (affectedRows === 0) {
      res.status(404).json(createErrorResponse("User not found"));
    } else {
      res.status(200).json(createSuccessResponse());
    }
  });
});

/* Jahrgang bearbeiten Request */
router.put('/', function(req, res) {
  const data = req.body;

  /* Check, if all needed parameters are there */
  const missingParam = validateParams(data, ["userId", "userYear"]);
  if (missingParam) return res.status(400).json(createErrorResponse(missingParam));

  /* Check, if parameters are of the correct type */
  if (!validateInt(data.userId)) {
    return res.status(422).json(createErrorResponse(`Invalid type for parameter: userId. Expected integer.`));
  }

  if (!validateInt(data.userYear)) {
    return res.status(422).json(createErrorResponse(`Invalid type for parameter: userYear. Expected integer.`));
  }

  executeQuery("CALL UpdateUser(?, ?)", [data.userId, data.userYear], res, (result) => {
    const user = result[0][0];
    if (!user) {
      res.status(404).json(createErrorResponse("User not found"));
    } else {
      res.status(200).json(createSuccessResponse({ user: user }));
    }
  });
});

/* Jahrgang eines Users bekommen */
router.get('/year', function(req, res) {

  //Check, if mandatory parameter is present
  if(!req.query.id) {
    return res.status(400).json(createErrorResponse("Missing parameter: id"));
  }

  const id = parseInt(req.query.id, 10);

  /* Check, if parameter is the correct type */
  if (!validateInt(id)) {
    return res.status(422).json(createErrorResponse("Invalid type for parameter: id. Expected integer."));
  }
  executeQuery("CALL GetUserYear(?)", [id], res, (result) => {
    const user = result[0][0];
    if (!user) {
      res.status(404).json(createErrorResponse("User not found"));
    } else {
      res.status(200).json(createSuccessResponse({ user: user }));
    }
  });
});

/* Alle User (aus einem Jahrgang) holen */
router.get('/', function(req, res) {
  const yearParam = req.query.year;
  if (yearParam !== undefined && !validateInt(yearParam)) {
    return res.status(422).json(createErrorResponse("Invalid type for parameter: year. Expected integer."));
  }

  const year = yearParam ? parseInt(yearParam, 10) : null;

  if (year !== null && (year > 5 || year < 1)) {
    return res.status(404).json(createErrorResponse("Invalid range for parameter: year. Must be between 1 and 5."));
  }

  executeQuery("CALL GetUsers(?)", [year], res, (result) => {
    const response = {
      users: result[0],
      ...(year !== null && { year })
    };
    res.status(200).json(createSuccessResponse(response));
  });
});

/* User bereits registriert */
router.get('/check', function(req, res) {

  const userName = req.query.name;
  if (!userName) return res.status(400).json(createErrorResponse("Missing parameter: name"));

  executeQuery("CALL CheckUser(?)", [userName], res, (result) => {
    res.status(200).json(createSuccessResponse({ registered: result[0][0].userRegistered === 1 }));
  });
});

module.exports = router;
