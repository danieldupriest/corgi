require("dotenv").config();
const Contact = require("../database/contact");
const Merge = require("../database/merge");
const { csvToHeadersAndDict } = require("../utils/csv-utils");
const { dbFields, userTextToContactArg } = require("../database/fields");

/**
 * Import as many contacts as possible automatically.
 */
exports.doMerge = async (req, res, next) => {
    // Load merge config
    const mergeId = req.params.mergeId;
    console.debug(`Merging contacts for merge id ${mergeId}.`);
    const merge = await Merge.findById(mergeId);
    const config = merge.config;

    // Load existing contacts
    const existingContacts = await Contact.findAll();

    // Load new contacts
    const path = process.env.TEMP_PATH + merge.file;
    const [_, newContacts] = await csvToHeadersAndDict(path);

    // Try to merge automatically
    for (let i = 0; i < newContacts.length; i++) {
        const newContact = newContacts[i];
        const match = findMatch(newContact, existingContacts, config);
        if (match) {
            console.debug(`Found match: ${match}`);
            if (automaticMergePossible(newContact, match, config)) {
                console.debug(`Automatic merge possible.`);
                try {
                    await autoMergeContact(newContact, match, config);
                } catch (err) {
                    console.error(`Error automerging contact: ${err.message}`);
                }
            } else {
                console.debug("Adding duplicate for row: " + i);
                merge.addDuplicate(i);
            }
        } else {
            await normalInsertContact(newContact, config);
        }
    }
    res.status(200).end();
};

async function normalInsertContact(newContact, config) {
    const { customFields, mergeMethods, sourceFields } = config;
    let args = {};
    for (const field of dbFields) {
        dbFieldName = field.name;
        const method = mergeMethods[dbFieldName];
        const source = sourceFields[dbFieldName];
        if (source == "none") {
            continue;
        }
        if (method == "custom") {
            const value = customFields[dbFieldName];
            args[dbFieldName] = userTextToContactArg(field, value);
        } else {
            const value = newContact[source];
            args[dbFieldName] = userTextToContactArg(field, value);
        }
    }
    const dbContact = new Contact(args);
    await dbContact.save();
}

async function autoMergeContact(newContact, existingContact, config) {
    const { customFields, mergeMethods, sourceFields } = config;
    let args = {};
    for (const field of dbFields) {
        const dbFieldName = field.name;
        const userFieldName = sourceFields[dbFieldName];
        if (userFieldName == "none") {
            continue;
        }
        const existingValue = existingContact[dbFieldName];
        const userValue = newContact[userFieldName];
        const newValue = userTextToContactArg(field, userValue);
        const method = mergeMethods[dbFieldName];
        const customValue = userTextToContactArg(
            field,
            customFields[dbFieldName]
        );
        if (method == "auto") {
            if (existingValue == field.defaultValue) {
                args[dbFieldName] = newValue;
            }
        } else if (method == "use-existing") {
        } else if (method == "use-new") {
            args[dbFieldName] = newValue;
        } else if (method == "custom") {
            if (field.type == "tags") {
                const tagsToAdd = customValue;
                let currentTagSet = new Set(existingContact[dbFieldName]);
                tagsToAdd.forEach((tag) => {
                    currentTagSet.add(tag);
                });
                args[dbFieldName] = Array.from(currentTagSet);
            } else {
                args[field.name] = customValue;
            }
        }
    }
    await existingContact.update(args);
}

/**
 * Updates a merge configuration and provides estimated
 * number of new imports, automatic merges, and manual merges.
 */
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
    const path = process.env.TEMP_PATH + merge.file;
    const [_, newContacts] = await csvToHeadersAndDict(path);
    const existingContacts = await Contact.findAll();
    let numberOfNewImports = 0;
    let numberOfAutoMerges = 0;
    let numberOfManualMerges = 0;
    for (const newContact of newContacts) {
        const match = findMatch(newContact, existingContacts, merge.config);
        if (match) {
            if (automaticMergePossible(newContact, match, merge.config)) {
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

function findMatch(newContact, existingContacts, config) {
    let matchFields = config.matchFieldsArray;
    let sourceFields = config.sourceFields;
    for (const existing of existingContacts) {
        let matchCount = 0;
        for (const fieldName of matchFields) {
            const newFieldName = sourceFields[fieldName];
            const existingValue = existing[fieldName].toLowerCase();
            const newValue = newContact[newFieldName].toLowerCase();

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

function automaticMergePossible(newContact, match, config) {
    const { sourceFields, mergeMethods } = config;

    for (const field of dbFields) {
        const dbFieldName = field.name;
        const dbFieldType = field.type;
        const userFieldName = sourceFields[dbFieldName];
        if (userFieldName == "none") {
            continue;
        }
        const newValue = newContact[userFieldName];
        const existingValue = match[dbFieldName];

        if (mergeMethods[dbFieldName] == "auto") {
            if (fieldsMatch(newValue, existingValue, dbFieldType)) {
                return true;
            }
            return false;
        }
    }
    return true;
}

function fieldsMatch(newValue, existingValue, dbFieldType) {
    if (dbFieldType == "text") {
        if (
            newValue == "" ||
            existingValue == "" ||
            newValue.toLowerCase() == existingValue.toLowerCase()
        ) {
            return true;
        }
    } else if (dbFieldType == "integer") {
        if (newValue == existingValue) {
            return true;
        }
    } else if (dbFieldType == "date") {
        if (new Date(newValue).getTime() == existingValue.getTime()) {
            return true;
        }
    } else if (dbFieldType == "tags") {
        if (Set(newValue.split(",")) == Set(existingValue)) {
            return true;
        }
    }
    return false;
}

exports.getDuplicates = async (req, res, next) => {
    Contact.findAll()
        .then((result) => {
            res.status(200).json({
                contacts: result,
                dbFields: dbFields,
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
    const path = process.env.TEMP_PATH + merge.file;
    const [headers, contacts] = await csvToHeadersAndDict(path);
    const data = {
        headers: headers,
        contacts: contacts,
        dbFields: dbFields,
    };
    return res.status(200).json(data);
};
