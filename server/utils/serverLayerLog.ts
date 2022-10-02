import chalk from "chalk";

export function colorServicePreposition(string: string) {
  return chalk.bgCyan(chalk.white("[ܡ main server]")) + " " + string;
}

export function applyServiceColor(string: string) {
  return colorServicePreposition(chalk.cyanBright(string));
}

export function applyFailureColor(string: string) {
  return colorServicePreposition(chalk.redBright(string));
}

export function applySuccessColor(string: string) {
  return colorServicePreposition(chalk.greenBright(string));
}

export function applyInfoColor(string: string) {
  return colorServicePreposition(chalk.blueBright(string));
}
