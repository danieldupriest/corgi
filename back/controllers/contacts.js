require("dotenv").config();
const fs = require("fs");
const { csvToHeadersAndDict } = require("../utils/csv-utils");
const Contact = require("../database/contact");
const Merge = require("../database/merge");
const { dbFields } = require("../fields");

const TEMP_PATH = process.env.TEMP_PATH;

exports.configure = async (req, res, next) => {
    const mergeId = req.params.mergeId;
    console.debug(`Configuring merge ${mergeId}.`);
    const merge = await Merge.findById(mergeId);
    const config = req.body.config;
    await merge.updateConfig(config);
    const [newImports, autoMerges, manualMerges] = await estimateNumbers(merge);
    res.status(200).json({
        mergeId,
        newImports,
        autoMerges,
        manualMerges,
    });
};

async function estimateNumbers(merge) {
    console.debug("Estimating numbers for " + merge);
    const path = TEMP_PATH + merge.file;
    const [headers, newContacts] = await csvToHeadersAndDict(path);
    const existingContacts = await Contact.findAll();
    let numberOfNewImports = 0;
    let numberOfAutoMerges = 0;
    let numberOfManualMerges = 0;
    for (const newContact of newContacts) {
        const allMatchFields = merge.config.matchFields;
        let actualMatchFields = [];
        for (const field of Object.keys(allMatchFields)) {
            if (allMatchFields[field] == "yes") {
                actualMatchFields.push(field);
            }
        }
        const match = findMatch(
            newContact,
            existingContacts,
            actualMatchFields
        );
        if (match) {
            const { mergeMethods } = merge.config;
            if (automaticMergePossible(newContact, match, mergeMethods)) {
                numberOfAutoMerges += 1;
            } else {
                numberOfManualMerges += 1;
            }
        } else {
            numberOfNewImports += 1;
        }
    }
    return [numberOfNewImports, numberOfAutoMerges, numberOfManualMerges];
}

function findMatch(newContact, existingContacts, matchFields) {
    for (const existing of existingContacts) {
        let matchCount = 0;
        for (const field of matchFields) {
            const existingValue = existing[field].toLowerCase();
            const newValue = newContact[field].toLowerCase();
            if (existingValue == newValue) {
                matchCount += 1;
            }
        }
        if (matchCount == matchFields.length) {
            return existing;
        }
    }
    return null;
}

function automaticMergePossible(newContact, match, mergeMethods) {
    for (const field of dbFields) {
        if (field.type == "auto") {
            const fieldToCheck = field.name;
            if (newContact[fieldToCheck] == "" || match[fieldToCheck] == "") {
                continue;
            } else {
                return false;
            }
        }
    }
    return true;
}

exports.doMerge = async (req, res, next) => {
    console.debug(`Running mergeContacts for merge id ${mergeId}.`);
    const mergeId = req.params.mergeId;
    let path, headers, contacts;
    try {
        const merge = await Merge.findById(mergeId);
        path = TEMP_PATH + merge.file;
        [headers, contacts] = await csvToHeadersAndDict(path);

        res.status(200).json({ message: "okay" });
    } catch (err) {
        err.status = 500;
        next(err);
    } finally {
        if (fs.existsSync(path)) {
            /*fs.unlink(path, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.debug(`Deleted temp file: ${path}`);
                }
            });*/
        }
    }
};

exports.getAllContacts = async (req, res, next) => {
    Contact.findAll()
        .then((result) => {
            res.status(200).json({
                contacts: result,
            });
        })
        .catch((err) => {
            err.status = 500;
            next(err);
        });
};

exports.getHeaders = async (req, res, next) => {
    const mergeId = req.params.mergeId;
    const merge = await Merge.findById(mergeId);
    const path = TEMP_PATH + merge.file;
    const [headers, contacts] = await csvToHeadersAndDict(path);
    return res.status(200).json({
        headers: headers,
        contacts: contacts,
    });
};

exports.uploadContacts = async (req, res, next) => {
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
