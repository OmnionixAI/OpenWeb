export class Logger {
    debugEnabled;
    constructor(debugEnabled = false) {
        this.debugEnabled = debugEnabled;
    }
    debug(message) {
        if (this.debugEnabled) {
            console.error(`[debug] ${message}`);
        }
    }
    info(message) {
        console.error(message);
    }
    error(message) {
        console.error(message);
    }
}
//# sourceMappingURL=logger.js.map