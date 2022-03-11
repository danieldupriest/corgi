/**
 * This is a console logging module with four pre-defined log
 * levels: debug, info, warn and error. It provides a class
 * to instantiate, and an enum for the log levels. Desired log
 * levels can be specified at the time of instantiation, or
 * individually shown or hidden after instantiation.
 *
 * @module
 */

/**
 * Used to specify a log level during instantiation or when using
 * the show/hide methods.
 */
export enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

/**
 * Logger class with 4 log levels and show/hide functionality. Import
 * this class to use it in your code.
 */
export default class Logger {
    logLevels: LogLevel[];

    /**
     * Constructs a new logger object. By default, all log levels are
     * shown. You may optionally pass in an array of LogLevel enums to
     * enable output for only those levels.
     * @param setLevels (LogLevel[]) - The array of levels to enable.
     */
    constructor(setLevels: LogLevel[] = []) {
        if (setLevels.length == 0) {
            this.logLevels = [
                LogLevel.Debug,
                LogLevel.Info,
                LogLevel.Warn,
                LogLevel.Error,
            ];
        } else {
            this.logLevels = setLevels;
        }
    }

    /**
     * Logs a debug level entry.
     * @param text (string) - The text to log.
     */
    debug(text: string): void {
        if (this.logLevels.includes(LogLevel.Debug))
            console.debug(text);
    }

    /**
     * Logs an info level entry.
     * @param text (string) - The text to log.
     */
    info(text: string): void {
        if (this.logLevels.includes(LogLevel.Info))
            console.info(text);
    }

    /**
     * Logs a warning level entry.
     * @param text (string) - The text to log.
     */
    warn(text: string): void {
        if (this.logLevels.includes(LogLevel.Warn))
            console.warn(text);
    }

    /**
     * Logs an error level entry.
     * @param text (string) - The text to log.
     */
    error(text: string): void {
        if (this.logLevels.includes(LogLevel.Error))
            console.error(text);
    }

    /**
     * Logs an entry regardless of log level settings.
     * @param text (string) - The text to log.
     */
    log(text: string): void {
        console.log(text);
    }

    /**
     * Enables showing the specified log level. Settings for other
     * levels remain unchanged.
     * @param level (LogLevel) - The level to enable.
     */
    show(level: LogLevel): void {
        if (! this.logLevels.includes(level))
            this.logLevels.push(level);
    }

    /**
     * Disables showing the specified log level. Settings for other
     * levels remain unchanged.
     * @param level (LogLevel) - The level to disable.
     */
    hide(level: LogLevel): void {
        console.log(this.logLevels);
        const index = this.logLevels.indexOf(level);
        if (index > - 1)
            this.logLevels.splice(index, 1);
        console.log(this.logLevels);
    }
}