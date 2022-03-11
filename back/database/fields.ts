import { DbField } from "../utils/types"

export const fieldPrototypes = {
    key: {
        fromUser(input: string) {
            return input;
        },
        toDb(input: number) {
            return input;
        },
        fromDb(input: number) {
            return input;
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
            return words;
        },
        toDb(input: string) {
            return input;
        },
        fromDb(input: string) {
            return input;
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
        dbFieldType: "INTEGER",
        defaultValue: 0,
        readOnly: false,
    },
    tags: {
        fromUser(input: string) {
            const tags = input.split(/[,|, ]+/);
            return tags;
        },
        toDb(input: string[]) {
            return JSON.stringify(input);
        },
        fromDb(input: string) {
            return JSON.parse(input);
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
            const d = new Date(input);
            return d;
        },
        toDb(input: Date) {
            return input.getTime();
        },
        fromDb(input: number) {
            if (input == null)
                return null;
            return new Date(input);
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