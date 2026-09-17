const MONTH_MAP = { Nov: 11, Des: 12 };

export function parsePeriodeToDate(periode) {
  const match = periode.match(/^(\d{2})(\w{3})$/);
  if (!match) return null;
  const [, day, monStr] = match;
  const month = MONTH_MAP[monStr] ?? 1;
  return new Date(2025, month - 1, Number(day));
}

export function formatPeriode(periode) {
  const d = parsePeriodeToDate(periode);
  if (!d) return periode;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function sortPeriods(periods) {
  return [...periods].sort((a, b) => parsePeriodeToDate(a) - parsePeriodeToDate(b));
}