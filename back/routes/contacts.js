const express = require("express")
const router = express.Router()
const upload = require('multer')({ dest: 'tmp/' })
const { getAllContacts, uploadContacts, mergeContacts } = require("../controllers/contacts")

router.get("/", getAllContacts)
router.post("/upload", upload.single('file'), uploadContacts)
router.post("/merge", mergeContacts)

module.exports = router