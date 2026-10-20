import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SavedRecordsTable, type RecordColumns } from './SavedRecordsTable';

interface Row {
  id: string;
  name: string;
  designation: string;
  school: string;
  account: string;
  amount: string;
  applyDate: string;
}

const columns: RecordColumns<Row> = {
  name: (r) => r.name,
  designation: (r) => r.designation,
  school: (r) => r.school,
  account: (r) => r.account,
  amount: (r) => r.amount,
  applicationDate: (r) => r.applyDate,
  searchable: (r) => [r.name, r.school, r.account],
  id: (r) => r.id,
};

const rows: Row[] = [
  { id: 'a1', name: 'আবেদনকারী এক', designation: 'সহকারী শিক্ষক', school: 'সপ্রাবি', account: '12345', amount: '6250', applyDate: '2025-01-09' },
  { id: 'b2', name: 'আবেদনকারী দুই', designation: 'প্রধান শিক্ষক', school: 'সপ্রাবি দুই', account: '6789', amount: '1000', applyDate: '2025-02-11' },
];

const table = (records: Row[]) =>
  renderToStaticMarkup(
    <SavedRecordsTable
      records={records}
      title="তালিকা"
      columns={columns}
      onEditRecord={() => {}}
      onPrintRecord={() => {}}
      onDownloadPdfRecord={() => {}}
      onDeleteRecord={() => {}}
      onNewRecord={() => {}}
      onExportCSV={() => {}}
    />
  );

describe('shared saved-records table', () => {
  it('shows every record with the four action buttons of a row', () => {
    const html = table(rows);
    expect(html.match(/<tr /g)).toHaveLength(3); // header + two rows
    expect(html.match(/btn-record-print-/g)).toHaveLength(2);
    expect(html.match(/btn-record-edit-/g)).toHaveLength(2);
    expect(html.match(/btn-record-download-/g)).toHaveLength(2);
  });

  it('prints the count and the digits in Bengali', () => {
    const html = table(rows);
    expect(html).toContain('২ টি আবেদন');
    expect(html).toContain('১২৩৪৫');
    expect(html).toContain('০৯/০১/২০২৫');
  });

  it('replaces the table with the same empty state in every app', () => {
    const empty = table([]);
    expect(empty).not.toContain('<table');
    expect(empty).toContain('p-12 text-center');
    expect(empty).toContain('btn-export-csv');
  });
});
