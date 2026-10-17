import { activeLocale } from "@/app/i18n/active";
import { getFormatters } from "@/app/i18n/format";
import { MESSAGES } from "@/app/i18n/messages";
import type { ScanResponse } from "@/app/lib/api";

/**
 * Plain-text report of a scan, in the language the interface is shown in.
 *
 * Test names are translated by test id; each test's message comes from the
 * scanning engine and is kept as it arrived.
 */
export function formatScanReport(scanResult: ScanResponse) {
  const locale = activeLocale();
  const t = MESSAGES[locale].scan;
  const format = getFormatters(locale);

  const header = `${t.report.title}\n${'='.repeat(50)}\n\n`;
  const info = `${t.report.targetUrl}: ${scanResult.target_url}\n`;
  const status = `${t.report.status}: ${t.status[scanResult.status] ?? scanResult.status}\n`;
  const created = `${t.report.scanDate}: ${format.dateTime(scanResult.created_at)}\n`;
  const completed = scanResult.completed_at
    ? `${t.report.completed}: ${format.dateTime(scanResult.completed_at)}\n`
    : '';
  const separator = `\n${'='.repeat(50)}\n\n`;

  const testsHeader = `${t.report.results(scanResult.results.length)}\n${'-'.repeat(50)}\n\n`;

  const tests = scanResult.results.map((result, idx) => {
    const cleanMessage = result.message.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    const message = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    const name = t.tests[result.test_id] ?? result.test_name;
    const severity = t.severity[result.severity] ?? result.severity;

    return `${idx + 1}. ${name}\n` +
           `   ${t.report.status}: ${result.passed ? t.report.passed : t.report.failed}\n` +
           `   ${t.report.severity}: ${severity}\n` +
           `   ${t.report.message}: ${message}\n`;
  }).join('\n');

  const footer = `\n${'='.repeat(50)}\n` +
               `${t.report.generatedBy}\n` +
               `${format.dateTime(new Date())}`;

  return header + info + status + created + completed + separator + testsHeader + tests + footer;
}

export function downloadScanReport(scanResult: ScanResponse) {
  const report = formatScanReport(scanResult);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `antiginx-scan-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const report = { formatScanReport, downloadScanReport };

export default report;
