import { DbField, FieldType, FieldDict } from "../utils/types"
import Logger from "../utils/Logger"

const log = new Logger();

export const fieldPrototypes: FieldDict = {
    key: {
        fromUser(input: string) {
            return parseInt(input);
        },
        toDb(input: number) {
            return input;
        },
        fromDb(input: number) {
            return input;
        },
        matches(a: number, b: number) {
            return a == b;
        },
        dbFieldType: "INTEGER PRIMARY KEY AUTOINCREMENT",
        defaultValue: 0,
        readOnly: true,
    },
    text: {
        fromUser(input: string) {
            if (input == "") {
                return input;
            }
            const words = input.split(" ");
            for (let i = 0; i < words.length; i++) {
                words[i] =
                    words[i][0].toUpperCase() +
                    words[i].substring(1).toLowerCase();
            }
            return words.join(" ");
        },
        toDb(input: string) {
            return input;
        },
        fromDb(input: string) {
            return input;
        },
        matches(a: string, b: string) {
            log.debug(`Checking for match between ${a} of type ${typeof a} and ${b} of type ${typeof b}.`);
            return a == "" || b == "" || a.toLowerCase() == b.toLowerCase()
        },
        dbFieldType: "TEXT",
        defaultValue: "",
        readOnly: false,
    },
    integer: {
        fromUser(input: string) {
            return parseInt(input)
        },
        toDb(input: number) {
            return input;
        },
        fromDb(input: number) {
            return input;
        },
        matches(a: number, b: number) {
            return a == b;
        },
        dbFieldType: "INTEGER",
        defaultValue: 0,
        readOnly: false,
    },
    tags: {
        fromUser(input: string) {
            const tags = input.split(/[,|, ]+/);
            tags.sort();
            return tags;
        },
        toDb(input: string[]) {
            return JSON.stringify(input);
        },
        fromDb(input: string) {
            return JSON.parse(input);
        },
        matches(a: string[], b: string[]) {
            log.debug(`"Testing tag match between ${a} of type ${typeof a} and ${b} of type ${typeof b}.`);
            const x = new Set(a);
            const y = new Set(b);
            if (x.size !== y.size) return false;
            for (var xItem of x) if (!y.has(xItem)) return false;
            return true;
        },
        dbFieldType: "TEXT",
        defaultValue: [],
        readOnly: false,
    },
    date: {
        fromUser(input: string) {
            if (input == null || input == "") {
                return null;
            }
            const date = new Date(input)
            const utcDate = new Date(
                Date.UTC(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                )
            );
            log.debug(`Parsed new user date ${input} as ${utcDate}.`);
            return utcDate;
        },
        toDb(input: Date) {
            if (input == null)
                return null;
            return input.getTime();
        },
        fromDb(input: number) {
            if (input == null)
                return null;
            return new Date(input);
        },
        matches(a: Date, b: Date) {
            return a.getTime() == b.getTime();
        },
        dbFieldType: "INTEGER",
        defaultValue: null,
        readOnly: false,
    },
}

export const dbFields: DbField[] = [
    {
        name: "id",
        pretty_name: "ID",
        type: fieldPrototypes.key,
    },
    {
        name: "first_name_or_names",
        pretty_name: "First name(s)",
        type: fieldPrototypes.text,
    },
    {
        name: "last_name",
        pretty_name: "Last name",
        type: fieldPrototypes.text,
    },
    {
        name: "date_of_birth",
        pretty_name: "DOB",
        type: fieldPrototypes.date,
    },
    {
        name: "address_number",
        pretty_name: "House no.",
        type: fieldPrototypes.text,
    },
    {
        name: "address_street",
        pretty_name: "Street address",
        type: fieldPrototypes.text,
    },
    {
        name: "city",
        pretty_name: "City",
        type: fieldPrototypes.text,
    },
    {
        name: "state",
        pretty_name: "State",
        type: fieldPrototypes.text,
    },
    {
        name: "zip_code",
        pretty_name: "Zip",
        type: fieldPrototypes.text,
    },
    {
        name: "precinct",
        pretty_name: "Precinct",
        type: fieldPrototypes.text,
    },
    {
        name: "subdivision",
        pretty_name: "Subdivision",
        type: fieldPrototypes.text,
    },
    {
        name: "email",
        pretty_name: "E-mail",
        type: fieldPrototypes.text,
    },
    {
        name: "phone",
        pretty_name: "Phone",
        type: fieldPrototypes.text,
    },
    {
        name: "job",
        pretty_name: "Job",
        type: fieldPrototypes.text,
    },
    {
        name: "notes",
        pretty_name: "Notes",
        type: fieldPrototypes.text,
    },
    {
        name: "tags",
        pretty_name: "Tags",
        type: fieldPrototypes.tags,
    },
    {
        name: "votes",
        pretty_name: "Votes",
        type: fieldPrototypes.tags,
    },
    {
        name: "donations",
        pretty_name: "Donations",
        type: fieldPrototypes.integer,
    },
    {
        name: "voter_id",
        pretty_name: "Voter ID",
        type: fieldPrototypes.text,
    },
];

export const getFieldByName = (fieldName: string): DbField => {
    for (const field of dbFields) {
        if (field.name == fieldName) {
            return field;
        }
    }
    throw new Error(`Field ${fieldName} not found.`);
};