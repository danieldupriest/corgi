import "jest-extended";
import { fieldPrototypes } from "./fields";

/**
 *  Tests for key field type
 */

test("key field conversion from user string", () => {
    const input = "1";
    const output = fieldPrototypes.key.fromUser(input);
    expect(output).toStrictEqual(1);
});

test("key field conversion to database", () => {
    const input = 1
    const output = fieldPrototypes.key.toDb(input);
    expect(output).toStrictEqual(1);
});

test("key field conversion from database", () => {
    const input = 1
    const output = fieldPrototypes.key.fromDb(input);
    expect(output).toStrictEqual(1);
});

test("key field matches function (true)", () => {
    const a = 1
    const b = 1
    const result = fieldPrototypes.key.matches(a, b);
    expect(result).toStrictEqual(true);
});

test("key field matches function (false)", () => {
    const a = 1
    const b = 2
    const result = fieldPrototypes.key.matches(a, b);
    expect(result).toStrictEqual(false);
});

/**
 *  Tests for text field type
 */

test("text field conversion from user string", () => {
    const input = "test one";
    const output = fieldPrototypes.text.fromUser(input);
    expect(output).toStrictEqual("Test One");
});

test("text field conversion to database", () => {
    const input = "Test One"
    const output = fieldPrototypes.text.toDb(input);
    expect(output).toStrictEqual("Test One");
});

test("text field conversion from database", () => {
    const input = "Test One"
    const output = fieldPrototypes.text.fromDb(input);
    expect(output).toStrictEqual("Test One");
});

test("text field matches function (true, both values present)", () => {
    const a = "String"
    const b = "String"
    const result = fieldPrototypes.text.matches(a, b);
    expect(result).toStrictEqual(true);
});

test("text field matches function (true, one value present)", () => {
    const a = "String"
    const b = ""
    const result = fieldPrototypes.text.matches(a, b);
    expect(result).toStrictEqual(true);
});

test("text field matches function (false)", () => {
    const a = "String"
    const b = "Another String"
    const result = fieldPrototypes.text.matches(a, b);
    expect(result).toStrictEqual(false);
});

/**
 *  Tests for integer field type
 */

test("integer field conversion from user string", () => {
    const input = "1";
    const output = fieldPrototypes.integer.fromUser(input);
    expect(output).toStrictEqual(1);
});

test("integer field conversion to database", () => {
    const input = 1
    const output = fieldPrototypes.integer.toDb(input);
    expect(output).toStrictEqual(1);
});

test("integer field conversion from database", () => {
    const input = 1
    const output = fieldPrototypes.integer.fromDb(input);
    expect(output).toStrictEqual(1);
});

test("integer field matches function (true)", () => {
    const a = 1
    const b = 1
    const result = fieldPrototypes.integer.matches(a, b);
    expect(result).toStrictEqual(true);
});

test("integer field matches function (false)", () => {
    const a = 1
    const b = 2
    const result = fieldPrototypes.integer.matches(a, b);
    expect(result).toStrictEqual(false);
});

/**
 *  Tests for tags field type
 */

 test("tags field conversion from user string", () => {
    const input = "one, two,three";
    const output = fieldPrototypes.tags.fromUser(input);
    expect(output).toStrictEqual(["one", "three", "two"]);
});

test("tags field conversion to database", () => {
    const input = ["one", "two", "three"];
    const output = fieldPrototypes.tags.toDb(input);
    expect(output).toStrictEqual('["one","two","three"]');
});

test("tags field conversion from database", () => {
    const input = '["one","two","three"]';
    const output = fieldPrototypes.tags.fromDb(input);
    expect(output).toStrictEqual(["one", "two", "three"]);
});

test("tags field matches function (true)", () => {
    const a = ["one", "two", "three"];
    const b = ["two", "one", "three"];
    const result = fieldPrototypes.tags.matches(a, b);
    expect(result).toStrictEqual(true);
});

test("tags field matches function (false)", () => {
    const a = ["one", "two", "three"];
    const b = ["two", "three"];
    const result = fieldPrototypes.tags.matches(a, b);
    expect(result).toStrictEqual(false);
});

/**
 *  Tests for date field type
 */

test("date field conversion from user string (US format)", () => {
    const input = "8/16/1952";
    const output = fieldPrototypes.date.fromUser(input);
    expect(output).toStrictEqual(new Date("1952-08-16"));
});

test("date field conversion from user string (US format long)", () => {
    const input = "August 16, 1952";
    const output = fieldPrototypes.date.fromUser(input);
    expect(output).toStrictEqual(new Date("1952-08-16"));
});

test("date field conversion to database", () => {
    const input = new Date("1952-08-16");
    const output = fieldPrototypes.date.toDb(input);
    expect(output).toStrictEqual(-548380800000);
});

test("date field conversion from database", () => {
    const input = -548380800000
    const output = fieldPrototypes.date.fromDb(input);
    expect(output).toStrictEqual(new Date("1952-08-16"));
});

test("date field matches function (true)", () => {
    const a = new Date("2000-01-01");
    const b = new Date("2000-01-01");
    const result = fieldPrototypes.date.matches(a, b);
    expect(result).toStrictEqual(true);
});

test("date field matches function (false)", () => {
    const a = new Date("2000-01-01");
    const b = new Date("2000-01-02");
    const result = fieldPrototypes.date.matches(a, b);
    expect(result).toStrictEqual(false);
});
