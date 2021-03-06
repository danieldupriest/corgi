import db from "./database";
import { dbFields } from "./fields";
import { ContactPayload } from "../utils/types";

/**
 * Dataclass to store contact information. args are a dict of database fields, which will be
 * added as properties programmatically. Fields are specified in the /database/fields.ts file.
 */
export default class Contact {
    id: number;
    [key: string]: any; // Allow for arbitrary data to be added as property

    /**
     * Creates a new contact object.
     * @param args (ContactPayload) - Dict of database fields to add to the contact.
     */
    constructor(args: ContactPayload = {}) {
        this.id = 0;
        for (const field of dbFields) {
            this[field.name] = field.type.defaultValue;
            if (args[field.name]) {
                this[field.name] = args[field.name];
            } else {
                this[field.name] = field.type.defaultValue;
            }
        }
    }

    /**
     * Converts a contact into a string representation.
     * @returns (string)
     */
    toString(): string {
        return `Contact ${this.id}: ${this.first_name_or_names} ${this.last_name}`;
    }

    /**
     * Asynchronously returns a sorted list of all contacts
     * @returns (Promise<Contact[]>) - Promise containing an array of all contacts.
     */
    static findAll(): Promise<Contact[]> {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM contacts`, [], (err: any, rows: any[]) => {
                if (err) {
                    reject(
                        new Error(`Error retrieving contacts: ${err.message}`)
                    );
                }
                let results = [];
                console.log(rows);
                for (const row of rows) {
                    let args: ContactPayload = {};
                    for (const field of dbFields) {
                        if (row[field.name])
                            args[field.name] = field.type.fromDb(row[field.name]);
                    }
                    const contact = new Contact(args);
                    results.push(contact);
                }
                resolve(results);
            });
        });
    }

    /**
     * Asynchronously returns the specified contact
     * @param contactId (number) - ID of the contact to return.
     * @returns (Promise<Contact>) - Promise containing the specified contact.
     */
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
                    let args: ContactPayload = {};
                    for (const field of dbFields) {
                        if (row[field.name])
                            args[field.name] = field.type.fromDb(row[field.name]);
                    }
                    const contact = new Contact(args);
                    resolve(contact);
                }
            );
        });
    }

    /**
     * Asynchronously saves a new contact to the database.
     * @returns (Promise<Contact>) - Promise containing the new contact.
     */
    save(): Promise<Contact> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                let insertFields = [];
                let insertQuestions = [];
                let insertValues = [];
                for (const field of dbFields) {
                    if (field.type.readOnly) {
                        continue;
                    }
                    insertFields.push(field.name);
                    insertQuestions.push("?");
                    const value = field.type.toDb(this[field.name])
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

    /**
     * Asynchronously updates a Contact in the database.
     * @param args (ContactPayload) - Dict containing the fields to update.
     * @returns (Promise<Contact>) - Promise containing the updated contact.
     */
    update(args: ContactPayload = {}): Promise<Contact> {
        return new Promise((resolve, reject) => {
            if (Object.keys(args).length === 0) {
                reject(new Error("No args passed to update. Returning."));
            }    
            db.serialize(() => {
                let setStatements = [];
                let insertValues = [];
                for (const field of dbFields) {
                    if (field.type.readOnly) {
                        continue;
                    }
                    if (args[field.name] != undefined) {
                        setStatements.push(`${field.name} = ?`);
                        const newValue = field.type.toDb(this[field.name])
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
};