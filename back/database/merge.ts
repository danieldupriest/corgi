import db from "./database";
import { Duplicate, MergeConfig } from "../utils/types";

/**
 * The Merge class is a logical operation which introduces new contact data
 * into the database, along with a configuration to specify how conflicting
 * data should be handled.
 */
export default class Merge {
    id: number;
    config: MergeConfig;
    duplicates: Duplicate[];
    file: string;

    /**
     * Creates a new Merge operations.
     * @param file (string) - Name of the CSV file containing the new data to merge.
     * @param config (MergeConfig) - User settings for how contact data should be merged.
     * @param duplicates (Duplicate[]) - Array of CSV-row/contact-id pairs thought to
     * be duplicates of eachother.
     * @param id (number) - ID of merge operation.
     */
    constructor(file: string, config = null, duplicates = null, id = 0) {
        this.file = file;
        if (config != null) {
            this.config = config;
        } else {
            this.config = {
                customFields: {},
                matchFields: {},
                matchFieldsArray: [],
                mergeMethods: {},
                sourceFields: {},
            };
        }
        if (duplicates != null) {
            this.duplicates = duplicates;
        } else {
            this.duplicates = [];
        }
        this.id = id;
    }

    /**
     * Converts a merge config to string representation.
     * @returns (string) - String representation of merge operation.
     */
    toString(): string {
        return `Merge ${this.id}`;
    }

    /**
     * Deletes all merges from database.
     * @returns (Promise<void>) Empty promise.
     */
    static deleteAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM merges;`, [], (err: any, rows: any[]) => {
                if (err) {
                    reject(
                        new Error(`Error retrieving merges: ${err.message}`)
                    );
                }
                resolve();
            });
        });
    }

    /**
     * Asynchronously returns a list of all merge operations.
     * @returns (Promise<Merge[]>) Promise containing list of all merge operations.
     */
    static findAll(): Promise<Merge[]> {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM merges`, [], (err, rows) => {
                if (err) {
                    reject(
                        new Error(`Error retrieving merges: ${err.message}`)
                    );
                }
                let results = [];
                for (const row of rows) {
                    let result = new Merge(
                        row["file"],
                        JSON.parse(row["config"]),
                        JSON.parse(row["duplicates"])
                    );
                    results.push(result);
                }
                resolve(results);
            });
        });
    }

    /**
     * Asynchronously returns list of specified merge operation.
     * @param mergeId (number) - ID of the merge operation to return.
     * @returns (Promise<Merge>) - Promise containing the specified merge.
     */
    static findById(mergeId: number): Promise<Merge> {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM merges WHERE id = ?`,
                [mergeId],
                (err, row) => {
                    if (err) {
                        reject(
                            new Error(`Error retrieving merges: ${err.message}`)
                        );
                    }
                    //console.log(row);
                    let result = new Merge(
                        row["file"],
                        JSON.parse(row["config"]),
                        JSON.parse(row["duplicates"]),
                        row["id"]
                    );
                    //console.log(result);
                    resolve(result);
                }
            );
        });
    }

    /**
     * Asynchronously saves a new Merge to the database.
     * @returns (Promise<Merge>) - Promise containing the newly saved merge.
     */
    save(): Promise<Merge> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(
                    `INSERT INTO merges (file, config, duplicates) VALUES (?, ?, ?)`,
                    [
                        this.file,
                        JSON.stringify(this.config),
                        JSON.stringify(this.duplicates),
                    ],
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

    /**
     * Asynchronously updates the configuration of the merge operation.
     * @param config (MergeConfig) - New configuration to save.
     * @returns (Promise<Merge>) - Promise containing the newly updated merge object.
     */
    updateConfig(config: MergeConfig): Promise<Merge> {
        //console.debug("Updating config");
        this.config = config;
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE merges SET config = ? WHERE id = ?`,
                [JSON.stringify(config), this.id],
                (err) => {
                    if (err) {
                        console.error("Error " + err);
                        reject(
                            new Error(
                                `Error writing contact to database: ${err.message}`
                            )
                        );
                    }
                }
            );
            resolve(this);
        });
    }

    /**
     * Asynchronously adds a detected duplicate pair (requiring manual merging) to the merge job.
     * @param csvRowNumber (number) - Row number of the CSV file with the detected duplicate data.
     * @param existingContactId (number) - ID of the contact thought to be a duplicate.
     * @returns (Promise<Merge>) - Promise containing the newly updated merge object.
     */
    addDuplicate (csvRowNumber: number, existingContactId: number): Promise<Merge> {
        return new Promise((resolve, reject) => {
            for (const duplicate of this.duplicates) {
                if (duplicate.csvRowNumber == csvRowNumber) {
                    reject(new Error(`A duplicate for csvRowNumber ${csvRowNumber} already exists in this merge job.`));
                }
            }
            let existingSet = new Set(this.duplicates);
            existingSet.add({ csvRowNumber, existingContactId });
            this.duplicates = Array.from(existingSet);
            
            db.run(
                `UPDATE merges SET duplicates = ? WHERE id = ?`,
                [JSON.stringify(this.duplicates), this.id],
                (err: any) => {
                    if (err) {
                        console.error("Error " + err);
                        reject(
                            new Error(
                                `Error changing merge duplicates in database: ${err.message}`
                            )
                        );
                    }
                }
            );
            resolve(this);
        });
    }

    /**
     * Asynchronously removes a detected duplicate from the merge job. This is called each time
     * a user manually completes merging of a contact data row.
     * @param csvRowNumber (number) - Row number of the CSV file with the duplicate to remove.
     * @returns (Promise<Merge>) - Promise containing the newly updated merge object.
     */
    removeDuplicate(csvRowNumber: number): Promise<Merge> {
        const count = this.duplicates.length;
        this.duplicates = this.duplicates.filter((duplicate) => {
            return duplicate.csvRowNumber != csvRowNumber;
        });
        if (this.duplicates.length == count) {
            throw new Error(
                `Duplicate with csvRowNumber ${csvRowNumber} not found.`
            );
        }
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE merges SET duplicates = ? WHERE id = ?`,
                [JSON.stringify(this.duplicates), this.id],
                (err) => {
                    if (err) {
                        console.error("Error " + err);
                        reject(
                            new Error(
                                `Error changing merge duplicates in database: ${err.message}`
                            )
                        );
                    }
                }
            );
            resolve(this);
        });
    }
};