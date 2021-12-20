const csv = require("async-csv")
const fs = require("fs")

exports.csvToHeadersAndDict = async (filePath) => {
    const data = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'})
    const rows = await csv.parse(data)
    const headers = rows[0]
    const results = []
    rows.forEach((row) => {
        const result = {}
        for (const [index, field] of headers.entries()) {
            result[field] = row[index]
        }
        results.push(result)
    })
    return [headers, results]
}