import db from "./database";
import { Duplicate, MergeConfig } from "../utils/types";

// Merge object
export default class Merge {
    id: number;
    config: MergeConfig | null;
    duplicates: Duplicate[];
    file: string;

    // Creates a new merge object
    constructor(file: string, config = null, duplicates = null, id = 0): void {
        this.file = file;
        if (config != null) {
            this.config = config;
        } else {
            this.config = null;
        }
        if (duplicates != null) {
            this.duplicates = duplicates;
        } else {
            this.duplicates = [];
        }
        this.id = id;
    }

    // Converts a merge config to string representation
    toString(): string {
        return `Merge ${this.id}`;
    }

    // Deletes all merges from database
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

    // Asynchronously returns a list of all merges
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

    // Asynchronously saves a new Merge to the database
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

    // Asynchronously updates a Merge job
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

    // Asynchronously adds a duplicate pair (requiring manual merging) to a merge job.
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

    // Asynchronously updates a Merge job
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