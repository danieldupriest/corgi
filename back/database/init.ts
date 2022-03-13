import { config } from "dotenv";
config();
import fs from "fs";
import { dbFields } from "./fields.js";
import db from "./database";
import Logger from "../utils/Logger"

const databaseFile = process.env.DATABASE_FILE || "sqlite.db";

const log = new Logger();
initialize();

/**
 * Recreate the sqlite database and all tables. Contacts table is generated
 * based on the definition of dbFields array in /database/fields.ts file.
 */
function initialize(): void {
    //if (fs.existsSync(databaseFile)) {
    //    fs.unlinkSync(databaseFile);
    //}

    let initFields: string[] = [];
    dbFields.forEach((field) => {
        initFields.push(`${field.name} ${field.type.dbFieldType}`);
    });
    let joined = initFields.join(", ");
    let createContactsTableSQL = `CREATE TABLE IF NOT EXISTS contacts (${joined});`;
    log.debug(`Running SQL statement: '${createContactsTableSQL}'`);
    log.debug(`${JSON.stringify(db)}`);
    db.serialize(() => {
        db.run(
            createContactsTableSQL,
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