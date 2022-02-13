import { DbField, FieldType } from "../utils/types"

export const dbFields: DbField[] = [
    {
        name: "id",
        pretty_name: "ID",
        type: FieldType.integer,
        defaultValue: 0,
        dbFieldType: "INTEGER PRIMARY KEY AUTOINCREMENT",
        readOnly: true,
    },
    {
        name: "first_name_or_names",
        pretty_name: "First name(s)",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "last_name",
        pretty_name: "Last name",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "date_of_birth",
        pretty_name: "DOB",
        type: FieldType.date,
        defaultValue: null,
        dbFieldType: "INTEGER",
        readOnly: false,
    },
    {
        name: "address_number",
        pretty_name: "House no.",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "address_street",
        pretty_name: "Street address",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "city",
        pretty_name: "City",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "state",
        pretty_name: "State",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "zip_code",
        pretty_name: "Zip",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "precinct",
        pretty_name: "Precinct",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "subdivision",
        pretty_name: "Subdivision",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "email",
        pretty_name: "E-mail",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "phone",
        pretty_name: "Phone",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "job",
        pretty_name: "Job",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "notes",
        pretty_name: "Notes",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "tags",
        pretty_name: "Tags",
        type: FieldType.tags,
        defaultValue: [],
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "votes",
        pretty_name: "Votes",
        type: FieldType.tags,
        defaultValue: [],
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "donations",
        pretty_name: "Donations",
        type: FieldType.integer,
        defaultValue: 0,
        dbFieldType: "INTEGER",
        readOnly: false,
    },
    {
        name: "voter_id",
        pretty_name: "Voter ID",
        type: FieldType.text,
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
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

export const userTextToContactArg = (field: DbField, input: string): any => {
    if (field.type == FieldType.text) {
        if (input == "") {
            return input;
        }
        const words = input.split(" ");
        try {
            for (let i = 0; i < words.length; i++) {
                words[i] =
                    words[i][0].toUpperCase() +
                    words[i].substring(1).toLowerCase();
            }
        } catch (err) {
            console.error(`Error processing '${input}'`)
            if (err instanceof Error)
                console.error(err.message);
        }
        return words.join(" ");
    } else if (field.type == FieldType.integer) {
        return input;
    } else if (field.type == FieldType.tags) {
        const tags = input.split(/[,|, ]+/);
        return tags;
    } else if (field.type == FieldType.date) {
        if (input == null || input == "") {
            return null;
        } else {
            const d = new Date(input);
            return d;
        }
    }
    throw new Error(`Unsupported field type: ${field.type}`);
};