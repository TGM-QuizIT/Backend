const mariadb = require('mariadb');
const {createErrorResponse} = require("../config/response");

const database = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    user: process.env.MARIADB_ROOT_USER,
    password: process.env.MARIADB_ROOT_PW,
    database: process.env.MARIADB_DATABASE,
    port: process.env.MARIADB_PORT
})

/* Function, which executes the queries for the database */
async function executeQuery(query, params, res, successCallback) {
    let conn;
    try {
        conn = await database.getConnection();
        const result = await conn.query(query, params);
        successCallback(result);

    } catch (error) {
        console.error("MariaDB query error:", error);
        res.status(500).json(createErrorResponse("Internal Server Error"));

    } finally {
        if (conn) {
            try {
                conn.release();
            } catch (releaseError) {
                console.error("Error releasing MariaDB connection:", releaseError);
            }
        }
    }
}

module.exports = { executeQuery };