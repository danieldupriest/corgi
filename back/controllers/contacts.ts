import { config } from "dotenv";
config();
import fs from "fs";
import Contact from "../database/contact";
import Merge from "../database/merge";
import { dbFields } from "../database/fields";
import { Request, Response, NextFunction } from "express";

const TEMP_PATH = process.env.TEMP_PATH;

/**
 * API endpoint to deliver a JSON array containing all contact data.
 * @param req (Request)
 * @param res (Response)
 * @param next (NextError)
 */
export const getAllContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await Contact.findAll();
    const data = {
        contacts: result,
        dbFields: dbFields,
    };
    res.status(200).json(data);
};

/**
 * API endpoint for uploading a CSV file containing contact data for import. This
 * will trigger the creation of a new merge operation.
 * @param req (Request)
 * @param res (Response)
 * @param next (NextError)
 */
export const uploadContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const path = req.file?.path;
    if (!path) {
        throw new Error("File not found in request.")
    }
    const file = path.split("/").slice(-1)[0];
    if (fs.existsSync(path)) {
        console.debug(`Saved temp file: ${file}.`);
        const merge = new Merge(file);
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