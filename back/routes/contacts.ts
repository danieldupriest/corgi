import express from "express";
import { getAllContacts, uploadContacts } from "../controllers/contacts";
import {
    configure,
    getHeaders,
    doMerge,
    getDuplicates,
    overwrite,
} from "../controllers/merge";

const router = express.Router();

router.get("/", getAllContacts);

const upload = require("multer")({ dest: process.env.TEMP_PATH }).single("file");
router.post("/upload", upload, uploadContacts);

router.get("/upload/:mergeId/headers", getHeaders);
router.post("/upload/:mergeId/configure", configure);
router.post("/upload/:mergeId/merge", doMerge);
router.get("/upload/:mergeId/duplicates", getDuplicates);
router.post("/upload/:mergeId/overwrite/:existingId/with/:newId", overwrite);

export default router;
