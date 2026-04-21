import { Logger } from "../utils/logger.js";
import { OpenWeb } from "../core/openweb.js";
export declare function createContext(debug?: boolean): Promise<{
    config: import("../types/index.js").RuntimeConfig;
    logger: Logger;
    openweb: OpenWeb;
}>;
