require("dotenv").config();
const fs = require("fs");
const Contact = require("../database/contact");
const Merge = require("../database/merge");
const { dbFields } = require("../database/fields");

const TEMP_PATH = process.env.TEMP_PATH;

export const getAllContacts = async (rerouteq, res, next) => {
    const result = await Contact.findAll();
    const data = {
        contacts: result,
        dbFields: dbFields,
    };
    res.status(200).json(data);
};

export const uploadContacts = async (req, res, next) => {
    const path = req.file.path;
    const file = path.split("/").slice(-1)[0];
    if (fs.existsSync(path)) {
        console.debug(`Saved temp file: ${file}.`);
        const merge = new Merge(file, {});
        merge
            .save()
            .then((result) => {
                return res.status(201).json({
                    mergeId: merge.id,
                });
            })
            .catch((err) => {
                next(err);
            });
    } else {
        throw new Error("Error saving temporary file.");
    }
};
