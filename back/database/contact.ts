const db = require("./database");
const { dbFields } = require("./fields");

// Dataclass to store contact information. args should be an object containing user text fields
export default class Contact {
    // Creates a new contact
    constructor(args = {}) {
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
    static findAll() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM contacts`, [], (err, rows) => {
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
    static findById(contactId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM contacts WHERE id = ?`,
                [contactId],
                (err, row) => {
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
                    (err) => {
                        if (err) {
                            reject(
                                new Error(
                                    `Error writing contact to database: ${err.message}`
                                )
                            );
                        }
                    }
                ).get(`SELECT last_insert_rowid()`, (err, result) => {
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
    update(args = {}) {
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
                    (err) => {
                        if (err) {
                            reject(
                                new Error(
                                    `Error updating contact in database: ${err.message}`
                                )
                            );
                        }
                        resolve();
                    }
                );
            });
        });
    }

    contactFieldToDbField(field, value) {
        if (field.type == "text" || field.type == "integer") {
            return value;
        } else if (field.type == "tags") {
            const stringified = JSON.stringify(value);
            return stringified;
        } else if (field.type == "date") {
            if (this[field.name] == null) {
                return null;
            } else {
                return value.getTime();
            }
        }
    }

    static dbRowToContact(row) {
        let args = {};
        for (const field of dbFields) {
            if (row[field.name]) {
                if (field.type == "text" || field.type == "integer") {
                    args[field.name] = row[field.name];
                } else if (field.type == "tags") {
                    const tagList = JSON.parse(row[field.name]);
                    args[field.name] = tagList;
                } else if (field.type == "date") {
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
