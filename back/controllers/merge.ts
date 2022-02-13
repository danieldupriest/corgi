import { config } from "dotenv";
config();
import Contact from "../database/contact";
import Merge from "../database/merge";
import {
    ContactPayload,
    Dict,
    Duplicate,
    DuplicateField,
    DuplicateForUser,
    FieldType,
    MergeConfig,
    OverwritePlan
} from "../utils/types";
import { csvToHeadersAndDict } from "../utils/csv-utils";
import {
    dbFields,
    getFieldByName,
    userTextToContactArg,
} from "../database/fields";
import { Request, Response, NextFunction } from "express";

/**
 * Import as many contacts as possible automatically.
 */
export const doMerge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Load merge config
    const mergeId = parseInt(req.params.mergeId);
    console.debug(`Merging contacts for merge id ${mergeId}.`);
    const merge = await Merge.findById(mergeId);
    const config = merge.config;

    // Load existing contacts
    const existingContacts = await Contact.findAll();

    // Load new contacts
    const path = process.env.TEMP_PATH + merge.file;
    const [_, newContacts] = await csvToHeadersAndDict(path);

    // Try to merge automatically
    let newImportCount = 0;
    let automaticMergeCount = 0;
    let manualMergeCount = 0;
    for (let i = 0; i < newContacts.length; i++) {
        const testing = newContacts[i];
        const match = findMatch(testing, existingContacts, config);
        if (match) {
            if (automaticMergePossible(testing, match, config)) {
                try {
                    await autoMergeContact(testing, match, config);
                    automaticMergeCount += 1;
                } catch (err) {
                    if (err instanceof Error)
                        console.error(`Error automerging contact: ${err}`);
                    else
                        console.error(`Something went wrong.`);
                }
            } else {
                //console.debug("Adding duplicate for row: " + i);
                merge.addDuplicate(i, match.id);
                manualMergeCount += 1;
            }
        } else {
            await normalInsertContact(testing, config);
            newImportCount += 1;
        }
    }
    const data = {
        newImportCount,
        automaticMergeCount,
        manualMergeCount,
    };
    res.status(200).json(data);
};

async function normalInsertContact(testing: Dict, config: MergeConfig): Promise<void> {
    const { customFields, mergeMethods, sourceFields } = config;
    let args: Dict = {};
    for (const field of dbFields) {
        const dbFieldName = field.name;
        const method = mergeMethods[dbFieldName];
        const source = sourceFields[dbFieldName];
        if (source == "none") {
            continue;
        }
        if (method == "custom") {
            const value = customFields[dbFieldName];
            args[dbFieldName] = userTextToContactArg(field, value);
        } else {
            const value = testing[source];
            args[dbFieldName] = userTextToContactArg(field, value);
        }
    }
    const dbContact = new Contact(args);
    await dbContact.save();
}

async function autoMergeContact(testing: Dict, existingContact: Contact, config: MergeConfig): Promise<void> {
    const { customFields, mergeMethods, sourceFields } = config;
    let args: ContactPayload = {};
    for (const field of dbFields) {
        const dbFieldName = field.name;
        const userFieldName = sourceFields[dbFieldName];
        if (userFieldName == "none") {
            continue;
        }
        const existingValue = existingContact[dbFieldName];
        const userValue = testing[userFieldName];
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
            if (field.type == FieldType.tags) {
                const tagsToAdd = customValue;
                let currentTagSet = new Set(existingContact[dbFieldName]);
                tagsToAdd.forEach((tag: String) => {
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

async function manualMergeContact(
    testing: Dict,
    existingContact: Contact,
    config: MergeConfig,
    overwrites: OverwritePlan[],
): Promise<void> {
    // Automatically merge what is possible
    await autoMergeContact(testing, existingContact, config);

    // Prepare args for update of manual fields
    let args: ContactPayload = {};
    const { sourceFields } = config;
    for (const [dbFieldName, overwrite] of Object.entries(overwrites)) {
        console.log(`dbFieldName: ${dbFieldName}, overwrite: ${overwrite}`);
        if (!overwrite) {
            continue;
        }
        const userFieldName = sourceFields[dbFieldName];
        if (userFieldName == "none") {
            continue;
        }
        const userValue = testing[userFieldName];
        const field = getFieldByName(dbFieldName);
        const newValue = userTextToContactArg(field, userValue);
        args[dbFieldName] = newValue;
    }
    console.log(args);
    await existingContact.update(args);
}

/**
 * Updates a merge configuration and provides estimated
 * number of new imports, automatic merges, and manual merges.
 */
export const configure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const mergeId = parseInt(req.params.mergeId)
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

async function estimateNumbers(merge: Merge): Promise<[number, number, number]> {
    console.debug("Estimating numbers for " + merge);
    const path = process.env.TEMP_PATH + merge.file;
    const [_, newContacts] = await csvToHeadersAndDict(path);
    const existingContacts = await Contact.findAll();
    let numberOfNewImports = 0;
    let numberOfAutoMerges = 0;
    let numberOfManualMerges = 0;
    for (const testing of newContacts) {
        const match = findMatch(testing, existingContacts, merge.config);
        if (match) {
            if (automaticMergePossible(testing, match, merge.config)) {
                numberOfAutoMerges += 1;
            } else {
                numberOfManualMerges += 1;
            }
        } else {
            numberOfNewImports += 1;
        }
    }
    return new Promise((resolve, reject) => {
        resolve([numberOfNewImports, numberOfAutoMerges, numberOfManualMerges]);
    })
}

function findMatch(testing: Dict, existingContacts: Contact[], config: MergeConfig): Contact | null {
    let matchFields = config.matchFieldsArray;
    let sourceFields = config.sourceFields;
    for (const existing of existingContacts) {
        let matchCount = 0;
        for (const fieldName of matchFields) {
            const newFieldName = sourceFields[fieldName];
            const existingValue = existing[fieldName].toLowerCase();
            const newValue = testing[newFieldName].toLowerCase();

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

function automaticMergePossible(testing: Dict, match: Contact, config: MergeConfig): boolean {
    const { sourceFields, mergeMethods } = config;

    for (const field of dbFields) {
        const dbFieldName = field.name;
        const dbFieldType = field.type;
        const userFieldName = sourceFields[dbFieldName];
        if (userFieldName == "none") {
            continue;
        }
        const newValue = testing[userFieldName];
        const existingValue = match[dbFieldName];

        if (mergeMethods[dbFieldName] == "auto") {
            if (fieldsMatch(newValue, existingValue, dbFieldType)) {
                continue;
            }
            return false;
        }
    }
    return true;
}

/**
 * Compares a csv input field value to the value from an existing contact.
 * Returns true if values match.
 */
function fieldsMatch(newValue: any, existingValue: any, dbFieldType: FieldType): boolean {
    if (dbFieldType == FieldType.text) {
        if (
            newValue == "" ||
            existingValue == "" ||
            newValue.toLowerCase() == existingValue.toLowerCase()
        ) {
            return true;
        }
    } else if (dbFieldType == FieldType.integer) {
        if (newValue == existingValue) {
            return true;
        }
    } else if (dbFieldType == FieldType.date) {
        if (new Date(newValue).getTime() == existingValue.getTime()) {
            return true;
        }
    } else if (dbFieldType == FieldType.tags) {
        if (new Set(newValue.split(/[,|, ]/)) == new Set(existingValue)) {
            return true;
        }
    }
    return false;
}

export const getDuplicates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Load merge data and config
    const mergeId = parseInt(req.params.mergeId);
    const merge = await Merge.findById(mergeId);
    const { config, duplicates, file } = merge;
    const { matchFieldsArray, mergeMethods, sourceFields } = config;

    // Load csv contacts
    const path = process.env.TEMP_PATH + file;
    const [_, newContacts] = await csvToHeadersAndDict(path);

    // Iterate through duplicates and add to result
    let duplicatesForUser = [];
    for (const detectedDuplicate of duplicates) {
        const { csvRowNumber, existingContactId } = detectedDuplicate;
        let duplicateForUser: DuplicateForUser = {
            existingId: existingContactId,
            newId: csvRowNumber,
            fields: [],
        };
        const existingContact = await Contact.findById(existingContactId);
        const testing = newContacts[csvRowNumber];
        for (const field of dbFields) {
            const newValueSourceField = sourceFields[field.name];
            if (field.readOnly || newValueSourceField == "none") {
                continue;
            }
            const newValue = testing[newValueSourceField];
            const existingValue = existingContact[field.name];
            const mergeMethod = mergeMethods[field.name];
            let dupField: DuplicateField = {
                name: field.name,
                pretty_name: field.pretty_name,
                type: field.type,
                different: false,
                newData: userTextToContactArg(field, newValue),
                existingData: existingValue,
            };
            if (matchFieldsArray.includes(field.name)) {
                duplicateForUser.fields.push(dupField);
            } else if (
                mergeMethod == "auto" &&
                !fieldsMatch(newValue, existingValue, field.type)
            ) {
                dupField.different = true;
                duplicateForUser.fields.push(dupField);
            }
        }
        duplicatesForUser.push(duplicateForUser);
    }
    const data = {
        duplicates: duplicatesForUser,
    };
    res.status(200).json(data);
};

export const overwrite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Load merge data and config
    const { overwrites } = req.body;
    console.log(overwrites);
    const existingId = parseInt(req.params.existingId);
    const mergeId = parseInt(req.params.mergeId);
    const newId = parseInt(req.params.newId);
    const merge = await Merge.findById(mergeId);
    const { config, file } = merge;

    // Load csv contact
    const path = process.env.TEMP_PATH + file;
    const [_, newContacts] = await csvToHeadersAndDict(path);
    const testing = newContacts[newId];

    // Load db contact
    const existingContact = await Contact.findById(existingId);

    // Merge
    await manualMergeContact(testing, existingContact, config, overwrites);

    // Remove duplicate from merge object
    await merge.removeDuplicate(newId);

    res.status(200).end();
};

export const getHeaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const mergeId = parseInt(req.params.mergeId);
    const merge = await Merge.findById(mergeId);
    const path = process.env.TEMP_PATH + merge.file;
    const [headers, contacts] = await csvToHeadersAndDict(path);
    const data = {
        headers: headers,
        contacts: contacts,
        dbFields: dbFields,
    };
    res.status(200).json(data);
};