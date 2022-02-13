import db from "./database";
import { dbFields } from "./fields";
import { ContactPayload, DbField, FieldType } from "../utils/types";

// Dataclass to store contact information. args should be an object containing user text fields
export default class Contact {
    id: number;
    [key: string]: any; // Allow for arbitrary data to be added as property

    // Creates a new contact
    constructor(args: ContactPayload = {}) {
        this.id = 0;
        for (const field of dbFields) {
            this[field.name] = field.defaultValue;
            if (args[field.name]) {
                this[field.name] = args[field.name];
            } else {
                this[field.name] = field.defaultValue;
            }
        }
    }

    // Converts a contact to string representation
    toString() {
        return `Contact ${this.id}: ${this.first_name_or_names} ${this.last_name}`;
    }

    // Asynchronously returns a sorted list of all contacts
    static findAll(): Promise<Contact[]> {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM contacts`, [], (err: any, rows: any[]) => {
                if (err) {
                    reject(
                        new Error(`Error retrieving contacts: ${err.message}`)
                    );
                }
                let results = [];
                for (const row of rows) {
                    const contact = this.dbRowToContact(row);
                    results.push(contact);
                }
                resolve(results);
            });
        });
    }

    // Asynchronously returns a sorted list of all contacts
    static findById(contactId: number): Promise<Contact> {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM contacts WHERE id = ?`,
                [contactId],
                (err: any, row: any) => {
                    if (err) {
                        reject(
                            new Error(
                                `Error retrieving contact: ${err.message}`
                            )
                        );
                    }
                    const contact = this.dbRowToContact(row);
                    resolve(contact);
                }
            );
        });
    }

    // Asynchronously saves a new Contact to the database
    save() {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                let insertFields = [];
                let insertQuestions = [];
                let insertValues = [];
                for (const field of dbFields) {
                    if (field.readOnly) {
                        continue;
                    }
                    insertFields.push(field.name);
                    insertQuestions.push("?");
                    const value = this.contactFieldToDbField(
                        field,
                        this[field.name]
                    );
                    insertValues.push(value);
                }
                db.run(
                    `INSERT INTO contacts (${insertFields.join(
                        ", "
                    )}) VALUES (${insertQuestions.join(", ")})`,
                    insertValues,
                    (err: any) => {
                        if (err) {
                            reject(
                                new Error(
                                    `Error writing contact to database: ${err.message}`
                                )
                            );
                        }
                    }
                ).get(`SELECT last_insert_rowid()`, (err: any, result: any) => {
                    if (err) {
                        reject(new Error(`Error getting id: ${err.message}`));
                    }
                    this.id = result["last_insert_rowid()"];
                    resolve(this);
                });
            });
        });
    }

    // Asynchronously updates a Contact in the database
    update(args: ContactPayload = {}) {
        if (Object.keys(args).length === 0) {
            console.debug("No args passed to update. Returning.");
            return;
        }
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                let setStatements = [];
                let insertValues = [];
                for (const field of dbFields) {
                    if (field.readOnly) {
                        continue;
                    }
                    if (args[field.name] != undefined) {
                        setStatements.push(`${field.name} = ?`);
                        const newValue = this.contactFieldToDbField(
                            field,
                            args[field.name]
                        );
                        insertValues.push(newValue);
                    }
                }
                insertValues.push(this.id);
                db.run(
                    `UPDATE contacts SET ${setStatements.join(
                        ", "
                    )} WHERE id = ?;`,
                    insertValues,
                    (err: any) => {
                        if (err) {
                            reject(
                                new Error(
                                    `Error updating contact in database: ${err.message}`
                                )
                            );
                        }
                        resolve(this);
                    }
                );
            });
        });
    }

    contactFieldToDbField(field: DbField, value: any) {
        if (field.type == FieldType.text || field.type == FieldType.integer) {
            return value;
        } else if (field.type == FieldType.tags) {
            const stringified = JSON.stringify(value);
            return stringified;
        } else if (field.type == FieldType.date) {
            if (this[field.name] == null) {
                return null;
            } else {
                return value.getTime();
            }
        }
    }

    static dbRowToContact(row: any) {
        let args: ContactPayload = {};
        for (const field of dbFields) {
            if (row[field.name]) {
                if (field.type == FieldType.text || field.type == FieldType.integer) {
                    args[field.name] = row[field.name];
                } else if (field.type == FieldType.tags) {
                    const tagList = JSON.parse(row[field.name]);
                    args[field.name] = tagList;
                } else if (field.type == FieldType.date) {
                    if (row[field.name] == null) {
                        args[field.name] = null;
                    } else {
                        const unixSeconds = row[field.name];
                        const date = new Date(unixSeconds);
                        args[field.name] = date;
                    }
                } else {
                    args[field.name] = field.defaultValue;
                }
            }
        }
        return new Contact(args);
    }
};
