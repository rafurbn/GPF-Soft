import React, { useState, useRef } from 'react';
import { GpfDeathClaim } from '../types/gpf';
import {
  toBengaliNumber,
  formatBangladeshiCurrency,
} from '../utils/bengaliWords';
import { printClaimDocument, downloadClaimDocument } from '../utils/printAndDownload';
import {
  Search,
  Edit2,
  Trash2,
  Printer,
  Download,
  Plus,
  FileDown,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';

interface ClaimsDataTableProps {
  claims: GpfDeathClaim[];
  onEditClaim: (claim: GpfDeathClaim) => void;
  onDeleteClaim: (id: string) => void;
  onNewClaim: () => void;
  onShowToast: (msg: string) => void;
  onImportClaims?: (imported: GpfDeathClaim[]) => void;
  onSetPrintTarget?: (claim: GpfDeathClaim) => void;
}

export const ClaimsDataTable: React.FC<ClaimsDataTableProps> = ({
  claims,
  onEditClaim,
  onDeleteClaim,
  onNewClaim,
  onShowToast,
  onImportClaims,
  onSetPrintTarget,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup all claims as JSON (Unlimited save files export)
  const handleBackupAllJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(claims, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `GPF_Death_Claims_Unlimited_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast(`সকল (${claims.length}টি) ফাইলের ব্যাকআপ JSON ডাউনলোড সম্পন্ন হয়েছে।`);
    } catch {
      onShowToast('ফাইল ব্যাকআপ তৈরিতে ত্রুটি হয়েছে।');
    }
  };

  // Import claims from JSON (Unlimited files restore)
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (onImportClaims) {
              onImportClaims(parsed);
            }
          } else {
            onShowToast('ফাইলের ডাটা ফরম্যাট সঠিক নয়।');
          }
        } catch {
          onShowToast('ফাইল লোড করতে ব্যর্থ হয়েছে।');
        }
      };
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  // Export claims as CSV
  const handleExportCSV = () => {
    if (claims.length === 0) {
      onShowToast('এক্সপোর্ট করার মতো কোনো ফাইল নেই।');
      return;
    }
    const headers = [
      'ক্রমিক',
      'আবেদনকারী',
      'মৃত শিক্ষক/কর্মচারী',
      'সম্পর্ক',
      'পদবী',
      'বিদ্যালয়',
      'উপজেলা',
      'জেলা',
      'জিপিএফ হিসাব নং',
      'জমাকৃত টাকা',
      'আবেদনের তারিখ',
      'মৃত্যুর তারিখ',
      'স্থিতি',
    ];
    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = claims.map((c, i) => [
      i + 1,
      escapeCsv(c.applicantName),
      escapeCsv(c.deceasedEmployeeName),
      escapeCsv(c.relationship),
      escapeCsv(c.deceasedDesignation),
      escapeCsv(c.schoolName),
      escapeCsv(c.upazilaName),
      escapeCsv(c.districtName),
      escapeCsv(c.gpfAccountNo),
      escapeCsv(c.depositedAmount),
      escapeCsv(c.applicationDate),
      escapeCsv(c.deathDate),
      escapeCsv(c.status),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GPF_Death_Claims_Sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    onShowToast(`সকল ফাইলের এক্সেল (CSV) ডাউনলোড সম্পন্ন হয়েছে।`);
  };

  // Filter logic
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      !searchQuery ||
      claim.deceasedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.gpfAccountNo.includes(searchQuery) ||
      claim.upazilaName.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesDesignation = designationFilter === 'all' || claim.deceasedDesignation === designationFilter;

    return matchesSearch && matchesStatus && matchesDesignation;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'অনুমোদিত':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'সিএও অফিসে প্রেরিত':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'শিক্ষা অফিসে প্রক্রিয়াধীন':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'যাচাইকৃত':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const handlePrint = (claim: GpfDeathClaim) => {
    try {
      if (onSetPrintTarget) onSetPrintTarget(claim);
      printClaimDocument(claim);
      onShowToast(`"${claim.deceasedEmployeeName}" এর ৭টি পেজের প্রিন্ট প্রস্তুত করা হয়েছে।`);
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  const handleDownload = (claim: GpfDeathClaim) => {
    try {
      if (onSetPrintTarget) onSetPrintTarget(claim);
      downloadClaimDocument(claim);
      onShowToast(`"${claim.deceasedEmployeeName}" এর ৭টি পেজ অফিশিয়াল ফাইল ডাউনলোড হয়েছে।`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#0e1628] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden print:hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              সংরক্ষিত জিপিএফ চূড়ান্ত উত্তোলন তালিকা (ডেথ ক্লেইম)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
              {toBengaliNumber(claims.length)} টি আবেদন
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              আনলিমিটেড সেইভ ফাইল
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            নিবন্ধিত সকল মৃত সরকারি শিক্ষক ও কর্মচারীর সাধারণ ভবিষ্যৎ তহবিল চূড়ান্ত নিষ্পত্তি ফাইল
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden JSON file input for import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />

          {/* Backup All Files (JSON) */}
          <button
            onClick={handleBackupAllJson}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-600/30 hover:border-cyan-500/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="সকল সংরক্ষিত ফাইল ব্যাকআপ হিসেবে ডাউনলোড করুন"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ফাইল ব্যাকআপ</span>
          </button>

          {/* Import Backup File (JSON) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-600/30 hover:border-teal-500/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="পূর্বে সেভ করা ব্যাকআপ ফাইল ইমপোর্ট করে যুক্ত করুন"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ফাইল ইমপোর্ট</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-600/30 hover:border-amber-500/50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="সকল ক্লেইম এক্সেল (CSV) ফরম্যাটে ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">এক্সেল</span>
          </button>

          {/* Search box */}
          <div className="relative min-w-[170px] sm:min-w-[210px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষক, আবেদনকারী বা জিপিএফ নং..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Designation filter */}
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">সকল পদবী</option>
            <option value="প্রাক্তন সহকারী শিক্ষক">প্রাক্তন সহকারী শিক্ষক</option>
            <option value="প্রাক্তন প্রধান শিক্ষক(চ:দা:)">প্রাক্তন প্রধান শিক্ষক(চ:দা:)</option>
            <option value="প্রাক্তন প্রধান শিক্ষক">প্রাক্তন প্রধান শিক্ষক</option>
          </select>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">সকল স্থিতি</option>
            <option value="খসড়া">খসড়া</option>
            <option value="যাচাইকৃত">যাচাইকৃত</option>
            <option value="শিক্ষা অফিসে প্রক্রিয়াধীন">শিক্ষা অফিসে প্রক্রিয়াধীন</option>
            <option value="অনুমোদিত">অনুমোদিত</option>
            <option value="সিএও অফিসে প্রেরিত">সিএও অফিসে প্রেরিত</option>
          </select>

          {/* New entry button */}
          <button
            onClick={onNewClaim}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors border border-emerald-500 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ নতুন এন্ট্রি</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold">
              <th className="py-3 px-3 text-center w-12">ক্র.</th>
              <th className="py-3 px-3 min-w-[180px]">আবেদনকারী ও মৃত কর্মচারী</th>
              <th className="py-3 px-3 min-w-[200px]">বিদ্যালয় ও পদবী</th>
              <th className="py-3 px-3 min-w-[110px] text-center">জিপিএফ নং</th>
              <th className="py-3 px-3 min-w-[140px] text-right">জমাকৃত অর্থ (টাকা)</th>
              <th className="py-3 px-3 min-w-[110px] text-center">আবেদনের তারিখ</th>
              <th className="py-3 px-3 min-w-[110px] text-center">স্ট্যাটাস</th>
              <th className="py-3 px-3 min-w-[160px] text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <p className="text-sm">কোন জিপিএফ ডেথ ক্লেইম পাওয়া যায়নি।</p>
                  <p className="text-xs text-slate-500 mt-1">
                    সার্চ বা ফিল্টার পরিবর্তন করুন অথবা নতুন এন্ট্রি যুক্ত করুন।
                  </p>
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim, idx) => (
                <tr
                  key={claim.id}
                  className="hover:bg-slate-900/50 transition-colors group"
                >
                  {/* Serial */}
                  <td className="py-3 px-3 text-center text-slate-400 font-medium tabular-nums">
                    {toBengaliNumber(idx + 1)}
                  </td>

                  {/* Applicant & Deceased */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{claim.applicantName}</div>
                    <div className="text-[11px] text-slate-400">
                      ({claim.relationship} - মৃত {claim.deceasedEmployeeName})
                    </div>
                  </td>

                  {/* School & Designation */}
                  <td className="py-3 px-3">
                    <div className="text-slate-200 font-medium">{claim.schoolName}</div>
                    <div className="text-[11px] text-teal-400 font-medium">
                      {claim.deceasedDesignation} · {claim.upazilaName}
                    </div>
                  </td>

                  {/* GPF Account No */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                      {claim.gpfAccountNo}
                    </span>
                  </td>

                  {/* Deposited Amount */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-bold text-emerald-400 text-sm tabular-nums">
                      ৳ {formatBangladeshiCurrency(claim.depositedAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px] ml-auto">
                      {claim.depositedAmountInWords}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 text-center text-slate-300 tabular-nums">
                    <div>{claim.applicationDate}</div>
                    <div className="text-[10px] text-slate-500">মৃত্যু: {claim.deathDate}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        claim.status
                      )}`}
                    >
                      {claim.status}
                    </span>
                  </td>

                  {/* Actions: [Print] -> [Edit] -> [Delete] -> [Download] */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* 1. Print Button */}
                      <button
                        onClick={() => handlePrint(claim)}
                        className="p-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/70 border border-amber-500/40 hover:border-amber-400 transition-colors"
                        title="৭টি পেজ সরকারি ফাইল সরাসরি প্রিন্ট করুন"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* 2. Edit Button */}
                      <button
                        onClick={() => onEditClaim(claim)}
                        className="p-1.5 rounded-lg text-blue-300 hover:text-blue-200 hover:bg-blue-950/60 border border-transparent hover:border-blue-700/50 transition-colors"
                        title="ফর্মে সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* 3. Delete Button */}
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি নিশ্চিত যে "${claim.applicantName}" এর আবেদনটি মুছতে চান?`)) {
                            onDeleteClaim(claim.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 border border-transparent hover:border-rose-700/50 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* 4. Download Button (After Delete Button as requested) */}
                      <button
                        onClick={() => handleDownload(claim)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/70 border border-emerald-600/40 hover:border-emerald-500 transition-colors"
                        title="৭টি পেজ অফিশিয়াল ফাইল ডাউনলোড করুন"
                      >
                        <Download className="w-4 h-4" />
                      </button>
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
