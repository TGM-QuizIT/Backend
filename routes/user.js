var express = require('express');
var router = express.Router();
const mysql = require('mysql2');

//Datenbank-Objekt initialisieren
const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

/* User hinzufügen Request */
router.post('/', function(req, res, next) {
  let data = req.body;
  const responseError = {
    status: "Failure",
    reason: ""
  };
  const responseSuccess = {
    status: "Success",
    user: null
  }

  const requiredParameter = ["userName", "userYear"];

  /* Check, if all needed parameters are there */
  for (const parameter of requiredParameter) {
    if (!(parameter in data)) {
      responseError.reason = `Missing parameter: ${parameter}`
      return res.status(400).json(responseError);
    }
  }

  /* Check, if parameters are of the correct type */
  if (typeof data.userName !== 'string') {
    responseError.reason = 'Invalid type for parameter: userName. Expected string.';
    return res.status(422).json(responseError);
  }
  if (typeof data.userYear !== 'number' || !Number.isInteger(data.userYear)) {
    responseError.reason = 'Invalid type for parameter: userYear. Expected integer.';
    return res.status(422).json(responseError);
  }

  const query = "CALL InsertUser(?, ?)";
  database.query(query, [data.userName, data.userYear], (error, result) => {
    if (error) {
      responseError.reason = "Internal Server Error";
      res.status(500).json(responseError);
    } else {
      responseSuccess.user = result[0][0];
      res.status(200).json(responseSuccess);
    }
  });

});
module.exports = router;
