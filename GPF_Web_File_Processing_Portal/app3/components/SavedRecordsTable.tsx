import React, { useState } from 'react';
import { Search, FileSpreadsheet } from 'lucide-react';
import { ActionButton, RowDeleteButton } from '../../app-shared/ui/ActionButton';
import { LABELS } from '../../app-shared/ui/tokens';
import { FinalSavedApplicationRecord } from '../../src/types';
import { toBengaliDigits, formatBanglaCurrency } from '../../src/utils/bengaliConverter';
import { date } from '../../src/lib/format';

interface SavedRecordsTableProps {
  records: FinalSavedApplicationRecord[];
  onEditRecord: (record: FinalSavedApplicationRecord) => void;
  onPrintRecord: (record: FinalSavedApplicationRecord) => void;
  onDownloadPdfRecord: (record: FinalSavedApplicationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onNewApplication: () => void;
}

export const SavedRecordsTable: React.FC<SavedRecordsTableProps> = ({
  records,
  onEditRecord,
  onPrintRecord,
  onDownloadPdfRecord,
  onDeleteRecord,
  onNewApplication,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((r) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      (r.applicantName || '').toLowerCase().includes(q) ||
      (r.gpfAccountNo || '').toLowerCase().includes(q) ||
      (r.schoolName || '').toLowerCase().includes(q) ||
      (r.nidNumber || '').includes(q) ||
      (r.upazila || '').toLowerCase().includes(q) ||
      (r.district || '').toLowerCase().includes(q)
    );
  });

  // Export to Excel / CSV
  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'ক্র.নং',
      'আবেদনকারীর নাম',
      'পদবী',
      'বিদ্যালয়',
      'জিপিএফ হিসাব নং',
      'সর্বশেষ জমাকৃত টাকা',
      'প্রার্থীত টাকা (অংকে)',
      'প্রার্থীত টাকা (কথায়)',
      'মূল বেতন',
      'এনআইডি',
      'সন',
      'তারিখ',
      'আয়ন ব্যয়ন কর্মকর্তা',
      'উপজেলা',
      'জেলা'
    ];

    const rows = records.map((r, i) => [
      i + 1,
      `"${r.applicantName || ''}"`,
      `"${r.designation || ''}"`,
      `"${r.schoolName || ''}"`,
      `"${r.gpfAccountNo || ''}"`,
      `"${r.totalDepositedAmount || ''}"`,
      `"${r.requestedAmountNumber || ''}"`,
      `"${r.requestedAmountWords || ''}"`,
      `"${r.basicSalary || ''}"`,
      `"${r.nidNumber || ''}"`,
      `"${r.yearSession || ''}"`,
      `"${r.applicationDate || ''}"`,
      `"${r.ddoName || ''}"`,
      `"${r.upazila || ''}"`,
      `"${r.district || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GPF_Final_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-[#0b1328] rounded-xl border border-[#1a2845] shadow-2xl overflow-hidden">
      
      {/* Table Header Bar matching image.png */}
      <div className="bg-[#080f20] px-4 sm:px-6 py-3.5 border-b border-[#182642] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            সংরক্ষিত জিপিএফ চূড়ান্ত উত্তোলনের তালিকা ({toBengaliDigits(records.length)} টি আবেদন)
          </h3>
        </div>

        {/* Right Search & Action Buttons matching image.png */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="শিক্ষক, বিদ্যালয় বা জিপিএফ নং..."
              className="pl-8.5 pr-3 py-1.5 text-xs bg-[#10192e] border border-[#1f3052] rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 w-44 sm:w-56 font-medium"
            />
          </div>

          {/* Excel Export button */}
                    <ActionButton
  kind="neutral"
  id="btn-export-csv"
  label={LABELS.excel}
  title={LABELS.exportCsv}
  onClick={exportToCSV}
/>

          {/* New Entry button */}
                    <ActionButton
  kind="new"
  id="btn-new-application-header"
  label={LABELS.new}
  title={LABELS.new}
  onClick={onNewApplication}
/>

        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#060b17] text-slate-400 border-b border-[#182642] text-xs font-semibold">
              <th className="py-2.5 px-3 w-12 text-center">ক্র:</th>
              <th className="py-2.5 px-4 w-60">আবেদনকারীর নাম ও পদবী</th>
              <th className="py-2.5 px-4 w-64">বিদ্যালয় ও জিপিএফ নং</th>
              <th className="py-2.5 px-4 w-44 text-center">প্রার্থীত অর্থ (টাকা)</th>
              <th className="py-2.5 px-4 w-32 text-center">আবেদনের তারিখ</th>
              <th className="py-2.5 px-4 w-56 text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#15223b] bg-[#0b1328] text-slate-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-1" />
                  <p className="font-medium text-slate-300">কোন সংরক্ষিত রেকর্ড পাওয়া যায়নি</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    উপরের ড্যাশবোর্ডে আবেদনকারীর তথ্য ইনপুট দিয়ে "ডাটা সেইভ করুন" বাটনে চাপুন
                  </p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec, idx) => (
                <tr 
                  key={rec.id || idx} 
                  className="hover:bg-[#0f1a33] transition-colors"
                >
                  {/* ক্র: */}
                  <td className="py-3 px-3 text-center font-bold text-slate-400">
                    {toBengaliDigits(idx + 1)}
                  </td>

                  {/* আবেদনকারীর নাম ও পদবী */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm">
                      {rec.applicantName || 'নামহীন আবেদনকারী'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {rec.designation || 'প্রধান শিক্ষক (অবসরপ্রাপ্ত)'}
                    </div>
                  </td>

                  {/* বিদ্যালয় ও জিপিএফ নং */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200">
                      {rec.schoolName || 'বিদ্যালয়ের নাম নেই'}
                    </div>
                    <div className="text-xs text-emerald-400 mt-0.5 font-medium">
                      হিসাব: {rec.gpfAccountNo ? toBengaliDigits(rec.gpfAccountNo) : '—'}
                    </div>
                  </td>

                  {/* প্রার্থীত অর্থ (টাকা) */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-emerald-400 text-sm">
                      {rec.requestedAmountNumber ? `${toBengaliDigits(rec.requestedAmountNumber)} টাকা` : '—'}
                    </span>
                  </td>

                  {/* আবেদনের তারিখ */}
                  <td className="py-3 px-4 text-center text-slate-300 text-xs">
                    {rec.applicationDate ? date(rec.applicationDate) : '—'}
                  </td>

                  {/* অ্যাকশন */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Print */}
                      <ActionButton kind="print" title={LABELS.print} onClick={() => onPrintRecord(rec)} />
                      <ActionButton kind="edit" title={LABELS.edit} onClick={() => onEditRecord(rec)} />
                      <RowDeleteButton onConfirm={() => rec.id && onDeleteRecord(rec.id)} />
                      <ActionButton kind="download" title={LABELS.download} onClick={() => onDownloadPdfRecord(rec)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
