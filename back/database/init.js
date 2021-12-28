require("dotenv").config();
const fs = require("fs");
const { dbFields } = require("./fields.js");

const databaseFile = process.env.DATABASE_FILE;

initialize();

function initialize() {
    if (fs.existsSync(databaseFile)) {
        fs.unlinkSync(databaseFile);
    }

    const db = require("./database");
    let initFields = [];
    dbFields.forEach((field) => {
        initFields.push(`${field.name} ${field.dbFieldType}`);
    });
    db.serialize(() => {
        db.run(
            `CREATE TABLE IF NOT EXISTS contacts
            (${initFields.join(", ")});`,
            (err) => {
                if (err) {
                    throw new Error(err.msg);
                }
            }
        ).run(
            `CREATE TABLE IF NOT EXISTS merges
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            file TEXT,
            config TEXT,
            duplicates TEXT)`,
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
