// Dataclass to store channel information
module.exports = class Channel {

    // Creates a new channel
    // @param {string} name Name of the channel beginning with #
    // @param {number} id ID of the channel for the database
    constructor(name, id=0) {
        this.id = id
        this.name = name
    }
  
    // Converts a channel to string representation
    toString() {
        return `${this.name}`
    }
  
    // Asynchronously returns true if a given channel exists in the database
    // @param {string} name Name of the channel to check
    static exists(name) {
     return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM channels WHERE name=?`, [name], (err, rows) => {
          if (err) {
            reject(new Error(`Error checking for channel existence: ${err.message}`))
          }
          if (rows.length == 0) {
            resolve(false)
          }
          resolve(true)
        })
      })
    }
  
    // Asynchronously returns a sorted list of all channels
    static fetchAll() {
      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM channels ORDER BY name DESC`, [], (err, rows) => {
          if (err) {
            reject(new Error(`Error retrieving channels: ${err.message}`))
          }
          let results = []
          for (const row of rows) {
            let result = new Channel(row['name'], row['id'])
            results.push(result)
          }
          resolve(results)
        })
      })
    }
  
    // Asynchronously saves a new channel to the database
    save() {
      return new Promise((resolve, reject) => {
        db.serialize(()=> {
          db.run(`INSERT INTO channels (name) VALUES (?)`, [this.name], (err) => {
            if (err) {
              reject(new Error(`Error writing channel to database: ${err.message}`))
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