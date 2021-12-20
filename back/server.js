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

app.get('/', function (req, res) {
    res.json({
        message: 'Hello World'
    })
})
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

app.listen(port, () => {
    console.log(`CORGI server started on port ${port}.`)
})