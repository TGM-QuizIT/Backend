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
let responseError = {
  status: "Failure",
  reason: ""
};
let responseSuccess = {
  status: "Success"
};


/* User hinzufügen */
router.post('/', function(req, res, next) {
  let data = req.body;
  responseError = {
    status: "Failure",
    reason: ""
  };
  responseSuccess = {
    status: "Success",
    user: null
  };

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
      res.status(201).json(responseSuccess);
    }
  });

});

/* User löschen */
router.delete('/', function(req, res, next) {
  responseError = {
    status: "Failure",
    reason: ""
  };
  responseSuccess = {
    status: "Success"
  };

  //Check, if mandatory parameter is present
  if(!req.query.id) {
    responseError.reason = "Missing parameter: id"
    return res.status(400).json(responseError)
  }

  const id = parseInt(req.query.id, 10);

  /* Check, if parameter is the correct type */
  if (isNaN(id)) {
    responseError.reason = "Invalid type for parameter: id. Expected integer."
    return res.status(422).json(responseError);
  }

  const query = "CALL DeleteUser(?)";
  database.query(query, [id], (error, result) => {
    if (error) {
      responseError.reason = "Internal Server Error";
      res.status(500).json(responseError);
    } else {
        if (result[0][0].affectedRows == 0) {
          responseError.reason = "User not found";
          res.status(404).json(responseError);
        }
        else {
          res.status(200).json(responseSuccess);
        }
    }
  })



});

/* Jahrgang bearbeiten Request */
router.put('/', function(req, res, next) {
  let data = req.body;
  responseError = {
    status: "Failure",
    reason: ""
  };
  responseSuccess = {
    status: "Success",
    user: null
  };

  const requiredParameter = ["userId", "userYear"];

  /* Check, if all needed parameters are there */
  for (const parameter of requiredParameter) {
    if (!(parameter in data)) {
      responseError.reason = `Missing parameter: ${parameter}`
      return res.status(400).json(responseError);
    }
  }

  /* Check, if parameters are of the correct type */
  if (typeof data.userId !== 'number' || !Number.isInteger(data.userId)) {
    responseError.reason = `Invalid type for parameter: userId. Expected integer.`;
    return res.status(422).json(responseError);
  }

  if (typeof data.userYear !== 'number' || !Number.isInteger(data.userYear)) {
    responseError.reason = `Invalid type for parameter: userYear. Expected integer.`;
    return res.status(422).json(responseError);
  }

  const query = "CALL UpdateUser(?, ?)";
  database.query(query, [data.userId, data.userYear], (error, result) => {
    if (error) {
      responseError.reason = "Internal Server Error";
      res.status(500).json(responseError);
    } else {
      if (result[0][0] == null) {
        responseError.reason = "User not found";
        res.status(404).json(responseError);

      }
      else {
        responseSuccess.user = result[0][0];
        res.status(200).json(responseSuccess);
      }
    }
  });
});

/* Jahrgang eines Users bekommen */
router.get('/year', function(req, res, next) {
  responseError = {
    status: "Failure",
    reason: ""
  };
  responseSuccess = {
    status: "Success",
    user: null
  };

  //Check, if mandatory parameter is present
  if(!req.query.id) {
    responseError.reason = "Missing parameter: id"
    return res.status(400).json(responseError)
  }

  const id = parseInt(req.query.id, 10);

  /* Check, if parameter is the correct type */
  if (isNaN(id)) {
    responseError.reason = "Invalid type for parameter: id. Expected integer."
    return res.status(422).json(responseError);
  }

  const query = "CALL GetUserYear(?)";
  database.query(query, [id], (error, result) => {
    if (error) {
      responseError.reason = "Internal Server Error";
      res.status(500).json(responseError);
    } else {
      if (result[0][0] == null) {
        responseError.reason = "User not found";
        res.status(404).json(responseError);
      }
      else {
        responseSuccess.user = result[0];
        res.status(200).json(responseSuccess);
      }
    }
  })
});

/* Alle User (aus einem Jahrgang) holen */
router.get('/', function(req, res, next) {
  responseError = {
    status: "Failure",
    reason: ""
  };
  responseSuccess = {
    status: "Success"
  };
  let year;
  //Check, if parameter id is present
  if(!req.query.year) {
    year = null;
  } else {
    const yearQuery = parseInt(req.query.year, 10);

    /* Check, if parameter is the correct type */
    if (isNaN(yearQuery)) {
      responseError.reason = "Invalid type for parameter: year. Expected integer."
      return res.status(422).json(responseError);
    }
    if(yearQuery > 5 || yearQuery < 1) {
      responseError.reason = "Invalid range for parameter: year. Must be between 1 and 5."
      return res.status(404).json(responseError);
    }
    year = yearQuery;
  }
  const query = "CALL GetUsers(?)";
  database.query(query, [year], (error, result) => {
    if (error) {
      responseError.reason = "Internal Server Error";
      res.status(500).json(responseError);
    } else {
      if (year != null) {
        responseSuccess.year = year
      }
      responseSuccess.users = result[0];
      res.status(200).json(responseSuccess);
    }
  })

})

/* User bereits registriert */
router.get('/check', function(req, res, next) {
  responseError = {
    status: "Failure",
    reason: ""
  };
  responseSuccess = {
    status: "Success"
  };

  //Check, if mandatory parameter is present
  if(!req.query.name) {
    responseError.reason = "Missing parameter: name"
    return res.status(400).json(responseError)
  }

  const query = "CALL CheckUser(?)";
  database.query(query, [req.query.name], (error, result) => {
    if (error) {
      responseError.reason = "Internal Server Error";
      res.status(500).json(responseError);
    } else {
      responseSuccess.registered = result[0][0].userRegistered == 1;
      res.status(200).json(responseSuccess);
    }
  })

})

module.exports = router;
