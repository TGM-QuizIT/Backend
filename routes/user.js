var express = require('express');
var router = express.Router();
const mysql = require('mysql2');
const {response} = require("express");

//Datenbank-Objekt initialisieren
const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

/* Function, which creates an object for a successful response */
function createErrorResponse(reason) {
  return {status: "Failure", reason: reason};
}

/* Function, which creates an object for a failed response */
function createSuccessResponse(data = {}) {
  return {status: "Success", ...data};
}

/* Function, which checks, if all parameters are present */
function validateParams(data, requiredParams, res) {
  for (const param of requiredParams) {
    if (!(param in data)) {
      return `Missing parameter: ${param}`;
    }
  }
  return null;
}

/* Function, which executes the queries for the database */
function executeQuery(query, params, res, successCallback) {
  database.query(query, params, (error, result) => {
    if (error) {
      return res.status(500).json(createErrorResponse("Internal Server Error"));
    }
    successCallback(result);
  });
}

/* User hinzufügen */
router.post('/', function(req, res, next) {
  const data = req.body;

  // Check, if all necessary parameters are there
  const missingParam = validateParams(data, ["userName", "userYear"], res);
  if (missingParam) {
    return res.status(400).json(createErrorResponse(`Missing parameter: ${missingParam}`));
  }

  /* Check, if parameters are of the correct type */
  if (typeof data.userName !== 'string') {
    return res.status(422).json(createErrorResponse('Invalid type for parameter: userName. Expected string.'));
  }
  if (typeof data.userYear !== 'number' || !Number.isInteger(data.userYear)) {
    return res.status(422).json(createErrorResponse('Invalid type for parameter: userYear. Expected integer.'));
  }

  executeQuery("CALL InsertUser(?,?)", [data.userName, data.userYear], res, (result) => {
    res.status(201).json(createSuccessResponse({ user: result[0][0] }));
  });
});

/* User löschen */
router.delete('/', function(req, res, next) {

  //Check, if mandatory parameter is present
  if(!req.query.id) {
    return res.status(400).json(createErrorResponse("Missing parameter: id"));
  }

  const id = parseInt(req.query.id, 10);

  /* Check, if parameter is the correct type */
  if (isNaN(id)) {
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
router.put('/', function(req, res, next) {
  const data = req.body;

  /* Check, if all needed parameters are there */
  const missingParam = validateParams(data, ["userId", "userYear"]);
  if (missingParam) return res.status(400).json(createErrorResponse(missingParam));

  /* Check, if parameters are of the correct type */
  if (typeof data.userId !== 'number' || !Number.isInteger(data.userId)) {
    return res.status(422).json(createErrorResponse(`Invalid type for parameter: userId. Expected integer.`));
  }

  if (typeof data.userYear !== 'number' || !Number.isInteger(data.userYear)) {
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
router.get('/year', function(req, res, next) {

  //Check, if mandatory parameter is present
  if(!req.query.id) {
    return res.status(400).json(createErrorResponse("Missing parameter: id"));
  }

  const id = parseInt(req.query.id, 10);

  /* Check, if parameter is the correct type */
  if (isNaN(id)) {
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
router.get('/', function(req, res, next) {
  const yearParam = req.query.year;
  if (yearParam !== undefined && isNaN(parseInt(yearParam, 10))) {
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
router.get('/check', function(req, res, next) {

  const userName = req.query.name;
  if (!userName) return res.status(400).json(createErrorResponse("Missing parameter: name"));

  executeQuery("CALL CheckUser(?)", [userName], res, (result) => {
    res.status(200).json(createSuccessResponse({ registered: result[0][0].userRegistered === 1 }));
  });
});

module.exports = router;
