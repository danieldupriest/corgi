const express = require("express");
const router = express.Router();
const TEMP_PATH = process.env.TEMP_PATH;
const upload = require("multer")({ dest: TEMP_PATH }).single("file");
const {
    getAllContacts,
    uploadContacts,
    configContactMerge,
    mergeContacts,
} = require("../controllers/contacts");

router.get("/", getAllContacts);
router.post("/upload", upload, uploadContacts);
router.get("/config/:file", configContactMerge);
router.post("/merge", mergeContacts);

module.exports = router;
