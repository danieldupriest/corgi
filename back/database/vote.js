// Dataclass to store contact vote information
module.exports = class Vote {

    // Creates a new vote
    constructor(contactId, year, level="general",id=0) {
        this.id = id
        this.contactId = contactId
        this.year = year
        this.level = level
    }
  
    // Converts a vote to a string representation
    toString() {
        return `${this.year} ${this.level}`
    }
    
    // Asynchronously returns a sorted list of all channels
    static fetchAll() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM votes ORDER BY year, level DESC`, [], (err, rows) => {
            if (err) {
                reject(new Error(`Error retrieving votes: ${err.message}`))
            }

            let results = []
            for (const row of rows) {
                let result = new Vote(row['contactId'], row['year'], row['level'], row['id'])
                results.push(result)
            }
            resolve(results)
            })
        })
    }
  
    // Asynchronously saves a new vote to the database and returns the object with respective ID
    save() {
        return new Promise((resolve, reject) => {
            db.serialize(()=> {
                this.id = id
                this.contactId = contactId
                this.year = year
                this.level = level
        
                db.run(`INSERT INTO votes (contactId, year, level) VALUES (?, ?, ?, ?)`, [this.contactId, this.year, this.level], (err) => {
                    if (err) {
                        reject(new Error(`Error writing vote to database: ${err.message}`))
                    }
                })
                .get(`SELECT last_insert_rowid()`, (err, result) => {
                    if (err) {
                        reject(new Error(`Error getting id: ${err.message}`))
                    }
                    this.id = result
                    resolve(this)
                })
            })
        })
    }
}