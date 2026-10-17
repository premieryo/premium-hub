/** Release dates are Japanese calendar dates, not timestamps. */
export function formatReleaseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "発売日未確認";
  const [, year, month, day] = match;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return "発売日未確認";
  return `${year}年${Number(month)}月${Number(day)}日`;
}
