import { config } from "dotenv";
config();
import sqlite3 from "sqlite3"
sqlite3.verbose()

const dbFile = process.env.DATABASE_FILE || "sqlite.db"

export default new sqlite3.Database(dbFile, (err) => {
    if (err) {
        if (err instanceof Error)
            return console.error(err.message)
        return console.error("Something went wrong opening database.")
    }
    console.log("Connected to SQlite database")
})