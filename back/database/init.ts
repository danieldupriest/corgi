import { config } from "dotenv";
config();
import fs from "fs";
import { dbFields } from "./fields.js";

const databaseFile = process.env.DATABASE_FILE || "sqlite.db";

initialize();

function initialize(): void {
    if (fs.existsSync(databaseFile)) {
        fs.unlinkSync(databaseFile);
    }

    const db = require("./database");
    let initFields: string[] = [];
    dbFields.forEach((field) => {
        initFields.push(`${field.name} ${field.dbFieldType}`);
    });
    db.serialize(() => {
        db.run(
            `CREATE TABLE IF NOT EXISTS contacts
            (${initFields.join(", ")});`,
            (err: any) => {
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
            (err: any) => {
                if (err) {
                    throw new Error(err.msg);
                }
            }
        );
    });
    db.close((err: any) => {
        if (err) {
            console.error(err.message);
        }
    });
}
