export declare class Logger {
    private readonly debugEnabled;
    constructor(debugEnabled?: boolean);
    debug(message: string): void;
    info(message: string): void;
    error(message: string): void;
}
