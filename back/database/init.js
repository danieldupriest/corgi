require("dotenv").config()
const fs = require("fs")

const databaseFile = process.env.DATABASE_FILE

initialize()

function initialize() {
    if (fs.existsSync(databaseFile)) {
        fs.unlinkSync(databaseFile)
    }

    const db = require("./database")

    db.serialize( () => {
        db.run(`CREATE TABLE IF NOT EXISTS contacts
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name_or_names TEXT,
            last_name TEXT,
            date_of_birth INTEGER,
            address_number TEXT,
            address_street TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            precinct TEXT,
            subdivision TEXT,
            email TEXT,
            phone TEXT,
            job TEXT,
            tags TEXT,
            notes TEXT)`, (err) => {
                if (err) { throw new Error(err.msg) }
            })
        .run(`CREATE TABLE IF NOT EXISTS votes
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER,
            year INTEGER,
            level TEXT,
            FOREIGN KEY (contact_id)
            REFERENCES contacts (id)
            ON DELETE CASCADE)`,
            (err) => {
                if (err) { throw new Error(err.msg) }
            })
        .run(`CREATE TABLE IF NOT EXISTS donations
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER,
            date INTEGER,
            amount INTEGER,
            FOREIGN KEY (contact_id)
            REFERENCES contacts (id)
            ON DELETE CASCADE)`,
            (err) => {
                if (err) { throw new Error(err.msg) }
            })
        .run(`CREATE TABLE IF NOT EXISTS fields
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            pretty_name TEXT,
            type TEXT)`,
            (err) => {
                if (err) { throw new Error(err.msg) }
            })
        .run(`INSERT INTO fields (name, pretty_name, type) VALUES
            ("id", "ID", "integer"),
            ("first_name_or_names", "First name(s)", "text"),
            ("last_name", "Last name", "text"),
            ("date_of_birth", "DOB", "date"),
            ("address_number", "House no.", "text"),
            ("address_street", "Street address", "text"),
            ("city", "City", "text"),
            ("state", "State", "text"),
            ("zip_code", "Zip", "text"),
            ("precinct", "Precinct", "text"),
            ("subdivision", "Subdivision", "text"),
            ("email", "E-mail", "text"),
            ("phone", "Phone", "text"),
            ("job", "Job", "text"),
            ("tags", "Tags", "text"),
            ("notes", "Notes", "text")`, (err) => {
                if (err) { throw new Error(err.message) }
            })
    })
    db.close((err) => {
        if (err) {
            console.error(err.message)
        }
    })
}