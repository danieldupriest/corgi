require("dotenv").config()
const fs = require("fs")
const { csvToHeadersAndDict } = require("../utils/csv-utils")
const Contact = require("../database/contact")

const tempPath = process.env.TEMP_PATH

exports.getAllContacts = async (req, res, next) => {
    try{
        const contacts = await Contact.fetchAll()
        res.status(200).json(contacts)
    } catch (err) {
        err.status = 500
        next(err)
    }
}

exports.mergeContacts = async (req, res, next) => {
    res.json({message: "Null"})
}

exports.uploadContacts = async (req, res, next) => {
    const path = req.file.path

    try {
        const [headers, contacts] = await csvToHeadersAndDict(path)
        return res.json({
            message: "Upload successful!",
            headers: headers,
            contacts: contacts
        })
    } catch (err) {
        res.status = 500
        next(err)
    } finally {
        if (fs.existsSync(path)) {
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err)
                } else {
                    console.debug(`Deleted temp file: ${path}`)
                }
            })    
        }
    }
}