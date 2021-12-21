require("dotenv").config();
const fs = require("fs");
const { csvToHeadersAndDict } = require("../utils/csv-utils");
const Contact = require("../database/contact");

const TEMP_PATH = process.env.TEMP_PATH;

exports.getAllContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.fetchAll();
        res.status(200).json(contacts);
    } catch (err) {
        err.status = 500;
        next(err);
    }
};

exports.mergeContacts = async (req, res, next) => {
    res.json({ message: "Null" });
};

exports.uploadContacts = async (req, res, next) => {
    const path = req.file.path;
    const file = path.split("/").slice(-1)[0];
    if (fs.existsSync(path)) {
        console.debug(`Saved temp file: ${file}.`);
        return res.status(200).json({
            file,
        });
    } else {
        throw new Error("Error saving temporary file.");
    }
};

exports.configContactMerge = async (req, res, next) => {
    const file = req.params.file;
    const path = TEMP_PATH + file;
    try {
        console.log(`Trying to load CSV file: ${path}.`);
        const [headers, contacts] = await csvToHeadersAndDict(path);
        return res.status(200).json({
            headers: headers,
            contacts: contacts,
        });
    } catch (err) {
        res.status = 400;
        next(err);
    } finally {
        /*
        if (fs.existsSync(path)) {
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.debug(`Deleted temp file: ${path}`);
                }
            });
        }*/
    }
};
