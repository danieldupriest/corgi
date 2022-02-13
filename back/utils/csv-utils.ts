import csv from "async-csv";
import fs from "fs";
import { Dict } from "./types"

export const csvToHeadersAndDict = async (filePath: string): Promise<[string[], Dict[]]> => {
    console.debug(`Loading CSV file at ${filePath}`);
    const data = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
    const rows = await csv.parse(data);
    const headers: any = rows[0];
    const results: Dict[] = [];
    rows.forEach((row: any) => {
        const result: Dict = {};
        for (const [index, field] of headers.entries()) {
            result[field] = row[index];
        }
        results.push(result);
    });
    const first = results.shift();
    return [headers, results];
};