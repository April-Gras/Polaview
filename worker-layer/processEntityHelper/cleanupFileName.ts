export function cleanupFileName(name: string) {
  return (
    name
      .replace(/\[.*?\]/g, "")
      .replace(/\{}.*?\}/g, "")
      .replace(/\<.*?\>/g, "")
      .replace(/^\s+|\s+$|\s+(?=\s)/g, "")
      // Remove pesky .'s
      .replace(/\./gi, " ")
      // Remove pesky _'s
      .replace(/\_/gi, " ")
      .replace(/\[|\]|\(|\)|\{|\}|\<|\>/g, "")
      // Remove Season shit
      .replace(/S(?<season>\d{1,2})E(?<episode>\d{1,2}).*/gi, "")
      .replace(/\-|\_|/gi, "")
      .replace(/\S+ EDITION/gi, "")
      .trim()
      // Remove "Ext | Extended label on file name"
      .replace(/Ext$|Extended$/gi, "")
  );
}
