import { useState } from 'react';
import { Search } from 'lucide-react';
import { ActionButton, RowDeleteButton } from './ActionButton';
import { LABELS } from './tokens';
import { count, date, toBn } from '../../src/lib/format';

/**
 * The saved-records list used by app1, app2 and app3. Each app hands over the
 * six columns through `columns`, so the table itself never learns about the
 * different field spellings of the three forms and the three lists stay
 * visually identical.
 */
export interface RecordColumns<T> {
  name: (record: T) => string;
  designation: (record: T) => string;
  school: (record: T) => string;
  account: (record: T) => string;
  amount: (record: T) => string;
  applicationDate: (record: T) => string;
  /** Everything the search box may match on. */
  searchable: (record: T) => (string | null | undefined)[];
  id: (record: T) => string | undefined;
}

interface SavedRecordsTableProps<T> {
  records: T[];
  title: string;
  columns: RecordColumns<T>;
  onEditRecord: (record: T) => void;
  onPrintRecord: (record: T) => void;
  onDownloadPdfRecord: (record: T) => void;
  onDeleteRecord: (id: string) => void;
  onNewRecord: () => void;
  onExportCSV: () => void;
}

export function SavedRecordsTable<T>({
  records,
  title,
  columns,
  onEditRecord,
  onPrintRecord,
  onDownloadPdfRecord,
  onDeleteRecord,
  onNewRecord,
  onExportCSV,
}: SavedRecordsTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const query = searchTerm.toLowerCase().trim();
  const filteredRecords = query
    ? records.filter((record) =>
        columns
          .searchable(record)
          .some((value) => (value || '').toLowerCase().includes(query))
      )
    : records;

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden mt-8 mb-12"
      id="records-section"
    >
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <h3 className="text-lg font-bold text-white tracking-wide">
            {title} ({count(records.length, 'টি আবেদন')})
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="records-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="শিক্ষক, বিদ্যালয় বা জিপিএফ নং..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <ActionButton
            kind="neutral"
            id="btn-export-csv"
            onClick={onExportCSV}
            title={LABELS.exportCsv}
            label={LABELS.excel}
          />

          <ActionButton
            kind="new"
            id="btn-new-application-header"
            onClick={onNewRecord}
            title={LABELS.new}
            label={LABELS.new}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-medium text-slate-400">
              {records.length === 0 ? 'কোনো আবেদন এখনও সংরক্ষিত হয়নি' : 'এই খোঁজে কোনো আবেদন পাওয়া যায়নি'}
            </p>
            <p className="text-xs mt-1 text-slate-500">
              {records.length === 0
                ? `উপরের ফর্মে তথ্য দিয়ে "${LABELS.save}" বাটনে ক্লিক করলে আবেদন এখানে তালিকাভুক্ত হবে।`
                : 'অন্য নাম, বিদ্যালয় বা জিপিএফ নম্বর দিয়ে খুঁজে দেখুন।'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">ক্র:</th>
                <th className="py-3 px-4">আবেদনকারীর নাম ও পদবী</th>
                <th className="py-3 px-4">বিদ্যালয় ও জিপিএফ নং</th>
                <th className="py-3 px-4 text-right">প্রার্থীত অর্থ (টাকা)</th>
                <th className="py-3 px-4 text-center">আবেদনের তারিখ</th>
                <th className="py-3 px-4 text-center w-56">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRecords.map((record, index) => {
                const id = columns.id(record);
                return (
                  <tr key={id || index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{toBn(index + 1)}</td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{columns.name(record) || 'নামবিহীন'}</div>
                      <div className="text-xs text-slate-400">
                        {columns.designation(record) || 'পদবী উল্লেখ নেই'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">{columns.school(record) || 'বিদ্যালয় উল্লেখ নেই'}</div>
                      <div className="text-xs text-emerald-400 font-mono">
                        হিসাব: {toBn(columns.account(record)) || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {toBn(columns.amount(record)) || '০'}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">টাকা</span>
                    </td>

                    <td className="py-3 px-4 text-center text-slate-300 font-mono">
                      {date(columns.applicationDate(record)) || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          id={id ? `btn-record-print-${id}` : undefined}
                          kind="print"
                          title={LABELS.print}
                          onClick={() => onPrintRecord(record)}
                        />
                        <ActionButton
                          id={id ? `btn-record-edit-${id}` : undefined}
                          kind="edit"
                          title={LABELS.edit}
                          onClick={() => onEditRecord(record)}
                        />
                        <RowDeleteButton onConfirm={() => id && onDeleteRecord(id)} />
                        <ActionButton
                          id={id ? `btn-record-download-${id}` : undefined}
                          kind="download"
                          title={LABELS.download}
                          onClick={() => onDownloadPdfRecord(record)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
