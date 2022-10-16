import chalk from "chalk";

export function colorServicePreposition(string: string) {
  return chalk.bgMagenta(chalk.white("[ܡ data-layer]")) + " " + string;
}

export function applyServiceColor(string: string) {
  return colorServicePreposition(chalk.magentaBright(string));
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
