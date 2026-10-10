import React, { useState } from 'react';
import { GpfFormData } from '../../src/types';
import {
  Search,
  Printer,
  Edit2,
  Trash2,
  Download,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { toBanglaDigits } from '../../src/utils/numberToBanglaWords';

interface RecordsTableProps {
  records: GpfFormData[];
  onSelectRecordToEdit: (record: GpfFormData) => void;
  onSelectRecordToPrint: (record: GpfFormData) => void;
  onDownloadPdfRecord: (record: GpfFormData) => void;
  onDeleteRecord: (id: string) => void;
  onExportCSV?: () => void;
  onNewRecord?: () => void;
  onLoadSampleData?: () => void;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  onSelectRecordToEdit,
  onSelectRecordToPrint,
  onDownloadPdfRecord,
  onDeleteRecord,
  onExportCSV,
  onNewRecord,
  onLoadSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((rec) => {
    const q = searchTerm.toLowerCase();
    return (
      (rec.applicantName || '').toLowerCase().includes(q) ||
      (rec.schoolName || '').toLowerCase().includes(q) ||
      (rec.gpfAccNo || '').toLowerCase().includes(q) ||
      (rec.designation || '').toLowerCase().includes(q) ||
      (rec.applyDate || '').toLowerCase().includes(q)
    );
  });

  // Fallback CSV export if not provided by parent
  const handleExportCSVFallback = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    if (records.length === 0) return;
    const headers = ['ক্র.নং', 'আবেদনকারীর নাম', 'পদবী', 'বিদ্যালয়', 'জিপিএফ হিসাব নং', 'প্রার্থীত অর্থ (টাকা)', 'তারিখ'];
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.applicantName || ''}"`,
      `"${r.designation || ''}"`,
      `"${r.schoolName || ''}"`,
      `"${r.gpfAccNo || ''}"`,
      `"${r.requestedAmount || ''}"`,
      `"${r.applyDate || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GPF_Refundable_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden mt-8 mb-12" id="records-section">
      {/* Header Bar matching image.png */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <h3 className="text-lg font-bold text-white tracking-wide">
            সংরক্ষিত জিপিএফ অগ্রিম আবেদনের তালিকা ({toBanglaDigits(records.length)} টি আবেদন)
          </h3>
        </div>

        {/* Action and Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="records-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="শিক্ষক, বিদ্যালয় বা জিপিএফ নং..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* CSV export */}
          <button
            type="button"
            id="btn-export-csv"
            onClick={handleExportCSVFallback}
            title="এক্সেলে এক্সপোর্ট করুন (CSV)"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">এক্সেল</span>
          </button>

          {onNewRecord && (
            <button
              type="button"
              id="btn-new-application-header"
              onClick={onNewRecord}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন এন্ট্রি</span>
            </button>
          )}
        </div>
      </div>

      {/* Table view matching user's reference image */}
      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-medium text-slate-400">কোন আবেদন পাওয়া যায়নি</p>
            <p className="text-xs mt-1 text-slate-500">
              উপরের ড্যাশবোর্ডে তথ্য ইনপুট দিয়ে "ডাটা সেইভ করুন" বাটনে ক্লিক করুন।
            </p>
            {onLoadSampleData && (
              <button
                type="button"
                onClick={onLoadSampleData}
                className="mt-3 inline-block text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                নমুনা (Sample) তথ্য রিলোড করুন
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">ক্র:</th>
                <th className="py-3 px-4">আবেদনকারীর নাম ও পদবী</th>
                <th className="py-3 px-4">বিদ্যালয় ও জিপিএফ নং</th>
                <th className="py-3 px-4 text-right">প্রার্থীত অর্থ (টাকা)</th>
                <th className="py-3 px-4 text-center">আবেদনের তারিখ</th>
                <th className="py-3 px-4 text-center w-56">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRecords.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-slate-800/40 transition-colors">
                  {/* ক্র: */}
                  <td className="py-3 px-4 text-center text-slate-400 font-mono">
                    {toBanglaDigits(index + 1)}
                  </td>

                  {/* আবেদনকারীর নাম ও পদবী */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">
                      {record.applicantName || 'নামবিহীন'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {record.designation || 'পদবী উল্লেখ নেই'}
                    </div>
                  </td>

                  {/* বিদ্যালয় ও জিপিএফ নং */}
                  <td className="py-3 px-4">
                    <div className="text-slate-200">
                      {record.schoolName || 'বিদ্যালয় উল্লেখ নেই'}
                    </div>
                    <div className="text-xs text-amber-400 font-mono">
                      হিসাব: {toBanglaDigits(record.gpfAccNo) || '—'}
                    </div>
                  </td>

                  {/* প্রার্থীত অর্থ (টাকা) */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {toBanglaDigits(record.requestedAmount) || '০'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">টাকা</span>
                  </td>

                  {/* আবেদনের তারিখ */}
                  <td className="py-3 px-4 text-center text-slate-300 font-mono">
                    {toBanglaDigits(record.applyDate) || '—'}
                  </td>

                  {/* অ্যাকশন */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Print Button */}
                      <button
                        type="button"
                        onClick={() => onSelectRecordToPrint(record)}
                        title="আবেদনপত্র প্রিন্ট করুন"
                        className="p-1.5 rounded bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-700/40 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onSelectRecordToEdit(record)}
                        title="তথ্য এডিট করুন"
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => record.id && onDeleteRecord(record.id)}
                        title="মুছে ফেলুন"
                        className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => onDownloadPdfRecord(record)}
                        title="এই আবেদনের PDF ডাউনলোড করুন"
                        className="p-1.5 rounded bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/40 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
