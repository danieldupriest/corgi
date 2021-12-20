// Dataclass to store donation information
module.exports = class Donation {

    // Creates a new donation. Date defaults to now.        
    constructor(constactId, amount, date=null, id=0) {
        this.contactId = contactId
        this.amount = amount
        if (date != null) {
            this.date = date
        } else {
            this.date = Date.now()
        }
        this.id = id
    }
  
    // Converts a vote to string representation
    toString() {
        const date = new Date(this.date)
        const dateString = date.toLocaleDateString("en-US")
        return `${this.amount} donated on ${dateString}.`
    }
    
    // Asynchronously returns a sorted list of all donations
    static fetchAll() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM donations ORDER BY date, amount DESC`, [], (err, rows) => {
            if (err) {
                reject(new Error(`Error retrieving donations: ${err.message}`))
            }
            let results = []
            for (const row of rows) {
                let result = new Donation(row['amount'], row['date'], row['id'])
                results.push(result)
            }
            resolve(results)
            })
        })
    }
  
    // Asynchronously saves a new donation to the database
    save() {
        return new Promise((resolve, reject) => {
            db.serialize(()=> {
                db.run(`INSERT INTO donations (contact_id, amount, date) VALUES (?, ?, ?)`, [this.contactId, this.amount, this.date], (err) => {
                    if (err) {
                        reject(new Error(`Error writing donation to database: ${err.message}`))
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