export function formatDateLong(date: string, lang: string) {
  return Intl.DateTimeFormat(lang, {
    dateStyle: "long",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(date));
}

export function formatDateShort(date: string, lang: string) {
  const dateobj = new Date(date);
  return Intl.DateTimeFormat(lang, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateobj);
}

export function formatDateEllapsed(date: string | Date, lang: string) {
  let timestamp = (new Date(date).getTime() - new Date().getTime()) / 1000;
  const formater = new Intl.RelativeTimeFormat(lang, {
    style: "long",
    numeric: "auto",
    localeMatcher: "best fit",
  });

  if (timestamp > -60) return formater.format(Math.round(timestamp), "seconds");
  timestamp /= 60;
  if (timestamp > -60) return formater.format(Math.round(timestamp), "minutes");
  timestamp /= 60;
  if (timestamp > -60) return formater.format(Math.round(timestamp), "hours");
  timestamp /= 24;
  if (timestamp > -365) return formater.format(Math.round(timestamp), "days");
  timestamp /= 365;
  return formater.format(Math.round(timestamp), "years");
}
