require("dotenv").config()
const sqlite3 = require("sqlite3").verbose()
const dbFile = process.env.DATABASE_FILE

export default new sqlite3.Database(dbFile, (err) => {
    if (err) {
        return console.error(err.messagae)
    }
    console.log("Connected to SQlite database")
})