export class Logger {
  constructor(private readonly debugEnabled = false) {}

  debug(message: string): void {
    if (this.debugEnabled) {
      console.error(`[debug] ${message}`);
    }
  }

  info(message: string): void {
    console.error(message);
  }

  error(message: string): void {
    console.error(message);
  }
}
