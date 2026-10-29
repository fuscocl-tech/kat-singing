export const studio = {
  name: "Kat's Singing Studio",
  timeZone: "Australia/Sydney",
};

export function formatDate(value: string, withTime = false) {
  if (!value) return "";
  // Bare dates (YYYY-MM-DD) are calendar dates; everything else is an ISO timestamp.
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(isDateOnly ? `${value}T00:00:00Z` : value);
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
