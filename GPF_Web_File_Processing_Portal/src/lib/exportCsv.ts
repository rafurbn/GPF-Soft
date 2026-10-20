/**
 * One CSV writer for every app. Cells are always quoted and inner quotes are
 * doubled, so a Bengali name that contains a comma or a quote can no longer
 * shift the columns of the spreadsheet it opens.
 */
const cell = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const buildCsv = (headers: readonly string[], rows: readonly (readonly unknown[])[]): string =>
  '\uFEFF' + [headers.map(cell).join(','), ...rows.map((row) => row.map(cell).join(','))].join('\r\n');

/** `<base>_YYYY-MM-DD.csv` — the naming every app used to repeat. */
export const csvFileName = (base: string): string =>
  `${base}_${new Date().toISOString().slice(0, 10)}.csv`;

export const downloadCsv = (
  fileName: string,
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
): void => {
  const blob = new Blob([buildCsv(headers, rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
