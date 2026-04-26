import { Command } from "commander";
import { registerCommands } from "./commands.js";

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command();
  program
    .name("openweb")
    .description("OpenWeb: a browser CLI for live web research, extraction, and AI-assisted answers")
    .version("0.2.1")
    .showHelpAfterError("(run with --help for usage)")
    .option("--debug", "Enable debug logging");

  registerCommands(program);

  const subcommand = argv[2];
  if (subcommand === "help") {
    program.outputHelp();
    return;
  }
  if (subcommand === "version") {
    console.log("0.2.1");
    return;
  }

  try {
    await program.parseAsync(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`OpenWeb error: ${message}`);
    process.exitCode = 1;
  }
}
