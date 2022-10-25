import chalk from "chalk";

export function colorServicePreposition(string: string) {
  return chalk.bgWhiteBright(chalk.black("[ܡ worker-layer]")) + " " + string;
}

export function applyServiceColor(string: string) {
  return colorServicePreposition(chalk.whiteBright(string));
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
