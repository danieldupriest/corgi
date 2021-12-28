exports.jsonFieldToDisplayField = (field, input) => {
    if (field.type == "text" || field.type == "integer") {
        return input;
    } else if (field.type == "tags") {
        return input.join(", ");
    } else if (field.type == "date") {
        if (input == null) {
            return null;
        } else {
            const d = new Date(input);
            const month = d.getMonth();
            const monthText = "" + (month > 8 ? month + 1 : "0" + (month + 1));
            const date = d.getDate();
            const dateText = "" + (date > 9 ? date : "0" + date);
            const year = d.getFullYear();
            return `${monthText}/${dateText}/${year}`;
        }
    }
};
