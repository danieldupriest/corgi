const dbFields = [
    {
        name: "id",
        pretty_name: "ID",
        type: "integer",
        defaultValue: 0,
        dbFieldType: "INTEGER PRIMARY KEY AUTOINCREMENT",
        readOnly: true,
    },
    {
        name: "first_name_or_names",
        pretty_name: "First name(s)",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "last_name",
        pretty_name: "Last name",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "date_of_birth",
        pretty_name: "DOB",
        type: "date",
        defaultValue: null,
        dbFieldType: "INTEGER",
        readOnly: false,
    },
    {
        name: "address_number",
        pretty_name: "House no.",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "address_street",
        pretty_name: "Street address",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "city",
        pretty_name: "City",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "state",
        pretty_name: "State",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "zip_code",
        pretty_name: "Zip",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "precinct",
        pretty_name: "Precinct",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "subdivision",
        pretty_name: "Subdivision",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "email",
        pretty_name: "E-mail",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "phone",
        pretty_name: "Phone",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "job",
        pretty_name: "Job",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "notes",
        pretty_name: "Notes",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "tags",
        pretty_name: "Tags",
        type: "tags",
        defaultValue: [],
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "votes",
        pretty_name: "Votes",
        type: "tags",
        defaultValue: [],
        dbFieldType: "TEXT",
        readOnly: false,
    },
    {
        name: "donations",
        pretty_name: "Donations",
        type: "integer",
        defaultValue: 0,
        dbFieldType: "INTEGER",
        readOnly: false,
    },
    {
        name: "voter_id",
        pretty_name: "Voter ID",
        type: "text",
        defaultValue: "",
        dbFieldType: "TEXT",
        readOnly: false,
    },
];

const getFieldByName = (fieldName) => {
    for (const field of dbFields) {
        if (field.name == fieldName) {
            return field;
        }
    }
    throw new Error(`Field ${fieldName} not found.`);
};

const userTextToContactArg = (field, input) => {
    if (field.type == "text") {
        if (input == "") {
            return input;
        }
        const words = input.split(" ");
        try {
            for (let i = 0; i < words.length; i++) {
                words[i] =
                    words[i][0].toUpperCase() +
                    words[i].substr(1).toLowerCase();
            }
        } catch (err) {
            console.error(`Error processing '${input}'`);
            console.error(err.message);
        }
        return words.join(" ");
    } else if (field.type == "integer") {
        return input;
    } else if (field.type == "tags") {
        const tags = input.split(/[,|, ]+/);
        return tags;
    } else if (field.type == "date") {
        if (input == null || input == "") {
            return null;
        } else {
            const d = new Date(input);
            return d;
        }
    }
    throw new Error(`Unsupported field type: ${field.type}`);
};

module.exports = {
    dbFields,
    getFieldByName,
    userTextToContactArg,
};
