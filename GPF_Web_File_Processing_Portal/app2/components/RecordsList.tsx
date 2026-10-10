import React, { useState } from 'react';
import { Search, Printer, Edit, Trash2, Download, FileSpreadsheet, Plus } from 'lucide-react';
import { GpfNonRefundableFormData } from '../../src/types';
import { toBanglaNumber } from '../../src/utils/numberToBanglaWords';

interface RecordsListProps {
  records: GpfNonRefundableFormData[];
  onEditRecord: (record: GpfNonRefundableFormData) => void;
  onDeleteRecord: (id: string) => void;
  onPrintRecord: (record: GpfNonRefundableFormData) => void;
  onDownloadPdfRecord: (record: GpfNonRefundableFormData) => void;
  onNewRecord: () => void;
  onExportCSV: () => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onPrintRecord,
  onDownloadPdfRecord,
  onNewRecord,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.applicant_name && r.applicant_name.toLowerCase().includes(term)) ||
      (r.school_name && r.school_name.toLowerCase().includes(term)) ||
      (r.gpf_acc_no && r.gpf_acc_no.toLowerCase().includes(term)) ||
      (r.upazila_name && r.upazila_name.toLowerCase().includes(term)) ||
      (r.district_name && r.district_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden mt-8" id="records-section">
      {/* Header Bar */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <h3 className="text-lg font-bold text-white tracking-wide">
            সংরক্ষিত জিপিএফ অফেরতযোগ্য আবেদনের তালিকা ({toBanglaNumber(records.length)} টি আবেদন)
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* CSV export */}
          <button
            type="button"
            id="btn-export-csv"
            onClick={onExportCSV}
            title="এক্সেলে এক্সপোর্ট করুন (CSV)"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">এক্সেল</span>
          </button>

          <button
            type="button"
            id="btn-new-application-header"
            onClick={onNewRecord}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন এন্ট্রি</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-medium text-slate-400">কোন আবেদন পাওয়া যায়নি</p>
            <p className="text-xs mt-1 text-slate-500">
              উপরের ড্যাশবোর্ডে তথ্য ইনপুট দিয়ে "ডাটা সেইভ করুন" বাটনে ক্লিক করুন।
            </p>
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
              {filteredRecords.map((rec, index) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-400 font-mono">
                    {toBanglaNumber(index + 1)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">
                      {rec.applicant_name || 'নামবিহীন'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {rec.designation || 'পদবী উল্লেখ নেই'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200">
                      {rec.school_name || 'বিদ্যালয় উল্লেখ নেই'}
                    </div>
                    <div className="text-xs text-emerald-400 font-mono">
                      হিসাব: {toBanglaNumber(rec.gpf_acc_no) || '—'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {toBanglaNumber(rec.requested_amount) || '০'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">টাকা</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300 font-mono">
                    {toBanglaNumber(rec.apply_date) || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        id={`btn-record-print-${rec.id}`}
                        onClick={() => onPrintRecord(rec)}
                        title="আবেদনপত্র প্রিন্ট করুন"
                        className="p-1.5 rounded bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/40 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        id={`btn-record-edit-${rec.id}`}
                        onClick={() => onEditRecord(rec)}
                        title="তথ্য এডিট করুন"
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        id={`btn-record-delete-${rec.id}`}
                        onClick={() => onDeleteRecord(rec.id)}
                        title="মুছে ফেলুন"
                        className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        id={`btn-record-download-${rec.id}`}
                        onClick={() => onDownloadPdfRecord(rec)}
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
