require("dotenv").config();
const fs = require("fs");

const databaseFile = process.env.DATABASE_FILE;

initialize();

function initialize() {
    if (fs.existsSync(databaseFile)) {
        fs.unlinkSync(databaseFile);
    }

    const db = require("./database");

    db.serialize(() => {
        db.run(
            `CREATE TABLE IF NOT EXISTS contacts
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
            notes TEXT,
            votes TEXT,
            donation TEXT)`,
            (err) => {
                if (err) {
                    throw new Error(err.msg);
                }
            }
        )
            .run(
                `CREATE TABLE IF NOT EXISTS votes
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER,
            year INTEGER,
            level TEXT,
            FOREIGN KEY (contact_id)
            REFERENCES contacts (id)
            ON DELETE CASCADE)`,
                (err) => {
                    if (err) {
                        throw new Error(err.msg);
                    }
                }
            )
            .run(
                `CREATE TABLE IF NOT EXISTS donations
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER,
            date INTEGER,
            amount INTEGER,
            FOREIGN KEY (contact_id)
            REFERENCES contacts (id)
            ON DELETE CASCADE)`,
                (err) => {
                    if (err) {
                        throw new Error(err.msg);
                    }
                }
            )
            .run(
                `CREATE TABLE IF NOT EXISTS fields
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            pretty_name TEXT,
            type TEXT)`,
                (err) => {
                    if (err) {
                        throw new Error(err.msg);
                    }
                }
            );
    });
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });
}
