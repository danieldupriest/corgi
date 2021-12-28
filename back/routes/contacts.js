const express = require("express");
const router = express.Router();
const TEMP_PATH = process.env.TEMP_PATH;
const upload = require("multer")({ dest: TEMP_PATH }).single("file");
const { getAllContacts, uploadContacts } = require("../controllers/contacts");
const {
    configure,
    getHeaders,
    doMerge,
    getDuplicates,
} = require("../controllers/merge");

router.get("/", getAllContacts);
router.post("/upload", upload, uploadContacts);
router.get("/upload/:mergeId/headers", getHeaders);
router.post("/upload/:mergeId/configure", configure);
router.post("/upload/:mergeId/merge", doMerge);
router.get("/upload/:mergeId/duplicates", getDuplicates);

module.exports = router;
