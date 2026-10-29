export const studio = {
  name: process.env.STUDIO_NAME || "Kat's Singing Studio",
  timeZone: process.env.STUDIO_TIMEZONE || "Australia/Sydney",
};

export function formatDate(value: string, withTime = false) {
  if (!value) return "";
  // SQLite datetime('now') is UTC without a zone marker; bare dates (YYYY-MM-DD) are calendar dates.
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(isDateOnly ? `${value}T00:00:00Z` : `${value.replace(" ", "T")}Z`);
  return date.toLocaleString("en-AU", {
    timeZone: isDateOnly ? "UTC" : studio.timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function todayInStudio() {
  // en-CA formats as YYYY-MM-DD.
  return new Date().toLocaleDateString("en-CA", { timeZone: studio.timeZone });
}
