// Dataclass to store contact information
module.exports = class Contact {

    // Creates a new contact
    constructor(
        first_name_or_names="",
        last_name="",
        date_of_birth="",
        address_number="",
        address_street="",
        city="",
        state="",
        zip_code="",
        precinct="",
        subdivision="",
        email="",
        phone="",
        job="",
        tags="",
        notes="",
        id=0) {
        this.first_name_or_names=first_name_or_names,
        this.last_name=last_name,
        this.date_of_birth=date_of_birth,
        this.address_number=address_number,
        this.address_street=address_street,
        this.city=city,
        this.state=state,
        this.zip_code=zip_code,
        this.precinct=precinct,
        this.subdivision=subdivision,
        this.email=email,
        this.phone=phone,
        this.job=job,
        this.tags=tags,
        this.notes=notes,
        this.id=id
    }
      
    // Converts a contact to string representation
    toString() {
        return `${this.first_name_or_names} ${this.last_name}`
    }
    
    // Asynchronously returns a sorted list of all contacts
    static fetchAll() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM contacts ORDER BY last_name, first_name_or_names DESC`, [], (err, rows) => {
            if (err) {
                reject(new Error(`Error retrieving contacts: ${err.message}`))
            }
            let results = []
            for (const row of rows) {
                let result = new Contact(
                    row['first_name_or_names'],
                    row['last_name'],
                    row['date_of_birth'],
                    row['address_number'],
                    row['address_street'],
                    row['city'],
                    row['state'],
                    row['zip_code'],
                    row['precinct'],
                    row['subdivision'],
                    row['email'],
                    row['phone'],
                    row['job'],
                    row['tags'],
                    row['notes']
                    )
                results.push(result)
            }
            resolve(results)
            })
        })
    }
  
    // Asynchronously saves a new Contact to the database
    save() {
        return new Promise((resolve, reject) => {
            db.serialize(()=> {
                db.run(`INSERT INTO contacts (
                    first_name_or_names,
                    last_name,
                    date_of_birth,
                    address_number,
                    address_street,
                    city,
                    state,
                    zip_code,
                    precinct,
                    subdivision,
                    email,
                    phone,
                    job,
                    tags,
                    notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [this.first_name_or_names,
                    this.last_name,
                    this.date_of_birth,
                    this.address_number,
                    this.address_street,
                    this.city,
                    this.state,
                    this.zip_code,
                    this.precinct,
                    this.subdivision,
                    this.email,
                    this.phone,
                    this.job,
                    this.tags,
                    this.notes],
                    (err) => {
                        if (err) { reject(new Error(`Error writing contact to database: ${err.message}`))
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