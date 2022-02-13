const csv = require("async-csv");
const fs = require("fs");

export const csvToHeadersAndDict = async (filePath) => {
    console.debug(`Loading CSV file at ${filePath}`);
    const data = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
    const rows = await csv.parse(data);
    const headers = rows[0];
    const results = [];
    rows.forEach((row) => {
        const result = {};
        for (const [index, field] of headers.entries()) {
            result[field] = row[index];
        }
        results.push(result);
    });
    const first = results.shift();
    return [headers, results];
};
