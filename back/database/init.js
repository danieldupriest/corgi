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
        ).run(
            `CREATE TABLE IF NOT EXISTS merges
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            file TEXT,
            config TEXT)`,
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
