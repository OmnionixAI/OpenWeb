import { loadConfig } from "../utils/config.js";
import { Logger } from "../utils/logger.js";
import { OpenWeb } from "../core/openweb.js";

export async function createContext(debug = false) {
  const config = await loadConfig();
  const logger = new Logger(debug);
  const openweb = new OpenWeb(config);
  await openweb.init();
  return { config, logger, openweb };
}
