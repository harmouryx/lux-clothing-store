/**
 * Converts data rows into a downloadable CSV file in the browser.
 * @param filename Name of the file to save (e.g. 'lux_orders_report.csv')
 * @param headers Column header titles
 * @param rows Array of string/number arrays representing rows
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  if (typeof window === "undefined") return;

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? "").replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCsv).join(",");
  const rowLines = rows.map((r) => r.map(escapeCsv).join(","));
  const csvContent = [headerLine, ...rowLines].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
