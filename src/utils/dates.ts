export function formatDateLong(date: string, lang: string) {
  return Intl.DateTimeFormat(lang, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
}
