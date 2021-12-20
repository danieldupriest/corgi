require("dotenv").config()
const csv = require('async-csv')
const fs = require("fs")
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
    const parts = req.file.path.split("/")
    const filename = parts.slice(-1)[0]
    try {
        const data = fs.readFileSync(path, {encoding:'utf8', flag:'r'})
        const rows = await csv.parse(data)
        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
            } else {
                console.debug(`Deleted temp file: ${filename}`)
            }
        })
        return res.json({
            message: "Upload successful!",
            rows: rows
        })
    } catch (err) {
        res.status = 500
        next(err)
    }
}