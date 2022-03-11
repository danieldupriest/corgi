import "jest-extended";
import Logger, { LogLevel } from "./Logger";

/**
 * Test each logging function of the logger passed in.
 * @param logger (Logger) - Logger object to call methods of.
 */
function logAllLevels(logger: Logger): void {
    logger.debug("debug");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
}

/**
 * Configure jest to mock the console functions for testing purposes.
 * @param logArray (string[]) - Output array to hold logged entries.
 */
function setupMockingOutput(): string[] {
    const output: string[] = [];
    const methodsToMock = [ "debug", "info", "warn", "error", "log" ];
    for (const method of methodsToMock) {
        // @ts-expect-error for accessing protected method.
        jest.spyOn(global.console, method).mockImplementation((msg: string) => {
            output.push(msg);
        });
    }
    return output;
}

test("writing log with default settings (all levels output)", () => {
    const logger: Logger = new Logger();
    const output = setupMockingOutput();

    logAllLevels(logger);

    expect(output).toStrictEqual([ "debug", "info", "warn", "error" ]);
});

test("writing to log with log method (should always work)", () => {
    const logger: Logger = new Logger([ LogLevel.Debug ]);
    logger.hide(LogLevel.Debug);
    const output = setupMockingOutput();

    logger.log("log");

    expect(output).toStrictEqual([ "log" ]);
});

test("test specific debug log level", () => {
    const logger: Logger = new Logger([ LogLevel.Debug ]);
    const output = setupMockingOutput();

    logAllLevels(logger);

    expect(output).toStrictEqual([ "debug" ]);
});

test("test debug and error log levels", () => {
    const logger: Logger = new Logger([ LogLevel.Debug, LogLevel.Error ]);
    const output = setupMockingOutput();

    logAllLevels(logger);

    expect(output).toStrictEqual([ "debug", "error" ]);
});

test("test hiding the Warn log level", () => {
    const logger: Logger = new Logger();
    logger.hide(LogLevel.Warn);
    const output = setupMockingOutput();

    logAllLevels(logger);

    expect(output).toStrictEqual([ "debug", "info", "error" ]);
});

test("test showing the Debug log level", () => {
    const logger: Logger = new Logger([ LogLevel.Info ]);
    logger.show(LogLevel.Debug);
    const output = setupMockingOutput();

    logAllLevels(logger);

    expect(output).toStrictEqual([ "debug", "info" ]);
});