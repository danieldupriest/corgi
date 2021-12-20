require("dotenv").config()
const express = require('express')
const upload = require('multer')({ dest: 'tmp/' })
const csv = require('async-csv')
const cors = require('cors')
const fs = require('fs')
const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(cors())

app.post('/api/contacts/upload', upload.single('file'), async (req, res) => {
    const path = req.file.path
    try {
        const data = fs.readFileSync(path, {encoding:'utf8', flag:'r'})
        const rows = await csv.parse(data)
        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
            } else {
                console.debug(`Deleted temp file: ${path}`)
            }
        })
        return res.json({
            message: "Upload successful!",
            rows: rows
        })
    } catch (err) {
        console.error(err)
        return res.json({
            message: err 
        })
    }
})
app.use((req, res, next) => {
    const err = new Error("Page not found")
    err.status = 404
    next(err)
})
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    return res.json({
        error: err.message
    })
})

app.listen(port, () => {
    console.log(`CORGI server started on port ${port}.`)
})