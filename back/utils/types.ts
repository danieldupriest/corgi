export type ContactPayload = {
    [key: string]: any;
}

export type Dict = {
    [key: string]: string;
}

export type DbField = {
    name: string;
    pretty_name: string;
    type: FieldType;
    defaultValue: any;
    dbFieldType: string;
    readOnly: boolean;
}

export type Duplicate = {
    csvRowNumber: number,
    existingContactId: number,
}

export type DuplicateField = {
    name: string;
    pretty_name: string;
    type: FieldType;
    different: boolean;
    newData: any;
    existingData: any;
}

export type DuplicateForUser = {
    existingId: number;
    newId: number;
    fields: DuplicateField[];
}

export enum FieldType {
    "text",
    "integer",
    "date",
    "tags",
}

export type MergeConfig = {
    customFields: Dict;
    matchFields: Dict;
    matchFieldsArray: string[];
    mergeMethods: Dict;
    sourceFields: Dict;
};

export type OverwritePlan = {
    [key: string]: boolean;
}