const mysql = require('mysql2');
const {createErrorResponse} = require("../config/response");

//Datenbank-Objekt initialisieren
const database = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

/* Function, which executes the queries for the database */
function executeQuery(query, params, res, successCallback) {
    database.query(query, params, (error, result) => {
        if (error) {
            return res.status(500).json(createErrorResponse("Internal Server Error"));
        }
        successCallback(result);
    });
}

module.exports = { executeQuery };