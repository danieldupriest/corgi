const db = require("./database");

// Dataclass to store contact information
module.exports = class Merge {
    // Creates a new contact
    constructor(file, config = null, id = 0) {
        this.file = file;
        if (this.config != null) {
            this.config = config;
        } else {
            this.config = {};
        }
        this.id = id;
    }

    // Converts a merge config to string representation
    toString() {
        return `Merge ${this.id}`;
    }

    // Deletes all merges from database
    static deleteAll() {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM merges;`, [], (err, rows) => {
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
    static findAll() {
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
                        JSON.parse(row["config"])
                    );
                    results.push(result);
                }
                resolve(results);
            });
        });
    }

    static findById(mergeId) {
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
                        row["id"]
                    );
                    //console.log(result);
                    resolve(result);
                }
            );
        });
    }

    // Asynchronously saves a new Merge to the database
    save() {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(
                    `INSERT INTO merges (file, config) VALUES (?, ?)`,
                    [this.file, JSON.stringify(this.config)],
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
    updateConfig(config) {
        console.debug("Updating config");
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
            resolve();
        });
    }
};
