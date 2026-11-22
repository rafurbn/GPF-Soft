import React, { useState, useRef } from 'react';
import { ExBangladeshLeaveApplication } from '../types/leave';
import { toBengaliNumber, toEnglishNumber } from '../utils/bengaliWords';
import { downloadLeaveDocument, printLeaveDocument } from '../utils/leavePrintAndDownload';
import type { UserSession } from '../../src/types';
import { getDefaultLeaveFormValues } from '../utils/leaveInitialData';
import {
  Download,
  Edit2,
  FileDown,
  FileSpreadsheet,
  FolderUp,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from 'lucide-react';

interface LeaveDataTableProps {
  applications: ExBangladeshLeaveApplication[];
  onEditApplication: (app: ExBangladeshLeaveApplication) => void;
  onDeleteApplication: (id: string) => void;
  onNewApplication: () => void;
  onSelectPrintApplication: (app: ExBangladeshLeaveApplication) => void;
  onShowToast: (msg: string) => void;
  onImportApplications: (apps: ExBangladeshLeaveApplication[]) => void;
  currentUser?: UserSession;
}

function isValidLeaveApplication(item: unknown): item is Partial<ExBangladeshLeaveApplication> {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.applicantName === 'string' &&
    obj.applicantName.trim().length > 0 &&
    typeof obj.destinationCountry === 'string' &&
    typeof obj.leaveStartDate === 'string' &&
    typeof obj.leaveEndDate === 'string'
  );
}

function normalizeImportedApplication(
  raw: Partial<ExBangladeshLeaveApplication>,
  idx: number,
  currentUser?: UserSession,
): ExBangladeshLeaveApplication {
  const now = new Date().toISOString();
  const defaults = getDefaultLeaveFormValues(currentUser);
  return {
    ...defaults,
    ...raw,
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : `leave-app-import-${Date.now()}-${idx}`,
    serialNo: typeof raw.serialNo === 'number' ? raw.serialNo : idx + 1,
    leaveTakenYears: raw.leaveTakenYears || '০০',
    leaveTakenMonths: raw.leaveTakenMonths || '০০',
    leaveTakenDays: raw.leaveTakenDays || '০০',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };
}

function escapeCsvCell(value: string | number | undefined | null): string {
  const str = String(value ?? '').replace(/"/g, '""');
  return `"${str}"`;
}

export const LeaveDataTable: React.FC<LeaveDataTableProps> = ({
  applications,
  onEditApplication,
  onDeleteApplication,
  onNewApplication,
  onSelectPrintApplication,
  onShowToast,
  onImportApplications,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [designationFilter, setDesignationFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<ExBangladeshLeaveApplication | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupAllJson = () => {
    try {
      const json = JSON.stringify(applications, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = `ExBangladesh_Leave_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      onShowToast(`সকল (${toBengaliNumber(applications.length)}টি) ছুটি ফাইলের ব্যাকআপ ডাউনলোড সম্পন্ন হয়েছে।`);
    } catch {
      onShowToast('ফাইল ব্যাকআপ তৈরিতে ত্রুটি হয়েছে।');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || ''));
        if (!Array.isArray(parsed) || parsed.length === 0) {
          onShowToast('ফাইলের ডাটা ফরম্যাট সঠিক নয়।');
          return;
        }
        const validItems = parsed.filter(isValidLeaveApplication);
        if (validItems.length === 0) {
          onShowToast('এই JSON ফাইলে কোনো বৈধ বহি:বাংলাদেশ ছুটি আবেদন পাওয়া যায়নি।');
          return;
        }
        const normalized = validItems.map((item, idx) => normalizeImportedApplication(item, idx, currentUser));
        onImportApplications(normalized);
      } catch {
        onShowToast('JSON ফাইলটি পার্স করা যায়নি।');
      }
    };
    fileReader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      onShowToast('এক্সপোর্ট করার মতো কোনো ফাইল নেই।');
      return;
    }
    const headers = [
      'ক্রমিক',
      'আবেদনকারী',
      'পিতার নাম',
      'পদবী',
      'বিদ্যালয়',
      'উপজেলা',
      'জেলা',
      'গন্তব্য দেশ',
      'ভ্রমণের উদ্দেশ্য',
      'ছুটির মেয়াদ (শুরু)',
      'ছুটির মেয়াদ (শেষ)',
      'মোট দিন',
      'স্থিতি',
    ];
    const rows = applications.map((a, i) => [
      escapeCsvCell(i + 1),
      escapeCsvCell(a.applicantName),
      escapeCsvCell(a.fatherName),
      escapeCsvCell(a.designation),
      escapeCsvCell(a.schoolName),
      escapeCsvCell(a.upazilaName),
      escapeCsvCell(a.districtName),
      escapeCsvCell(a.destinationCountry),
      escapeCsvCell(a.leavePurpose),
      escapeCsvCell(a.leaveStartDate),
      escapeCsvCell(a.leaveEndDate),
      escapeCsvCell(a.leaveDays),
      escapeCsvCell(a.status),
    ]);

    const csvText = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ExBangladesh_Leave_Sheet_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('সকল ফাইলের এক্সেল (CSV) ডাউনলোড সম্পন্ন হয়েছে।');
  };

  const normalizedQuery = toEnglishNumber(searchQuery).trim().toLowerCase();
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      !normalizedQuery ||
      toEnglishNumber(app.applicantName).toLowerCase().includes(normalizedQuery) ||
      toEnglishNumber(app.schoolName).toLowerCase().includes(normalizedQuery) ||
      toEnglishNumber(app.destinationCountry).toLowerCase().includes(normalizedQuery) ||
      toEnglishNumber(app.upazilaName).toLowerCase().includes(normalizedQuery) ||
      toEnglishNumber(app.applicationDate).toLowerCase().includes(normalizedQuery);

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesDesignation =
      designationFilter === 'all' || app.designation === designationFilter;

    return matchesSearch && matchesStatus && matchesDesignation;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'অনুমোদিত':
        return 'text-emerald-400';
      case 'প্রেরিত':
        return 'text-cyan-400';
      case 'শিক্ষা অফিসে প্রক্রিয়াধীন':
        return 'text-amber-400';
      case 'যাচাইকৃত':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  const handlePrint = (app: ExBangladeshLeaveApplication) => {
    onSelectPrintApplication(app);
    printLeaveDocument(app);
    onShowToast(`"${app.applicantName}" এর ৬ পৃষ্ঠার প্রিন্ট ডায়ালগ প্রস্তুত করা হয়েছে।`);
  };

  const handleDownload = (app: ExBangladeshLeaveApplication) => {
    onSelectPrintApplication(app);
    downloadLeaveDocument(app);
    onShowToast(`"${app.applicantName}" এর ৬ পৃষ্ঠার অফিশিয়াল ফাইল ডাউনলোড হয়েছে।`);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden print:hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            সংরক্ষিত বহি:বাংলাদেশ ছুটি আবেদন তালিকা
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
            মোট {toBengaliNumber(applications.length)}টি আবেদন · ৬ পৃষ্ঠার সরকারি নথি ও ছাড়পত্র ফাইল
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleBackupAllJson}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="সকল সংরক্ষিত ফাইল JSON ব্যাকআপ হিসেবে ডাউনলোড করুন"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>ব্যাকআপ</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="JSON ব্যাকআপ ফাইল থেকে পুনরায় লোড করুন"
          >
            <FolderUp className="w-3.5 h-3.5 text-blue-400" />
            <span>ইমপোর্ট</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="এক্সেল (CSV) ফরম্যাটে ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onNewApplication}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1.5 transition-colors border border-emerald-500 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন আবেদন</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="আবেদনকারীর নাম, বিদ্যালয়, দেশ বা তারিখ দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">সকল পদবী</option>
            <option value="সহকারী শিক্ষক">সহকারী শিক্ষক</option>
            <option value="প্রধান শিক্ষক">প্রধান শিক্ষক</option>
            <option value="ভারপ্রাপ্ত প্রধান শিক্ষক">ভারপ্রাপ্ত প্রধান শিক্ষক</option>
            <option value="সহকারী প্রধান শিক্ষক">সহকারী প্রধান শিক্ষক</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">সকল স্থিতি</option>
            <option value="খসড়া">খসড়া</option>
            <option value="যাচাইকৃত">যাচাইকৃত</option>
            <option value="শিক্ষা অফিসে প্রক্রিয়াধীন">শিক্ষা অফিসে প্রক্রিয়াধীন</option>
            <option value="অনুমোদিত">অনুমোদিত</option>
            <option value="প্রেরিত">প্রেরিত</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold">
              <th className="py-3 px-3 text-center w-12">ক্র.</th>
              <th className="py-3 px-3 min-w-[180px]">আবেদনকারী ও পিতা</th>
              <th className="py-3 px-3 min-w-[200px]">বিদ্যালয় ও পদবী</th>
              <th className="py-3 px-3 min-w-[150px]">গন্তব্য দেশ ও উদ্দেশ্য</th>
              <th className="py-3 px-3 min-w-[150px] text-center">ছুটির সময়কাল</th>
              <th className="py-3 px-3 min-w-[100px] text-center">আবেদনের তারিখ</th>
              <th className="py-3 px-3 min-w-[120px] text-center">স্থিতি</th>
              <th className="py-3 px-3 min-w-[150px] text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 px-4 text-center">
                  <p className="text-sm text-slate-300 font-medium">
                    কোনো ছুটি আবেদন পাওয়া যায়নি
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন একটি আবেদন যোগ করুন।
                  </p>
                  <button
                    type="button"
                    onClick={onNewApplication}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন আবেদন যোগ করুন</span>
                  </button>
                </td>
              </tr>
            ) : (
              filteredApps.map((app, index) => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 tabular-nums">
                    {toBengaliNumber(index + 1)}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-100">{app.applicantName}</div>
                    <div className="text-[11px] text-slate-400">পিতা: {app.fatherName}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-slate-200">{app.schoolName}</div>
                    <div className="text-[11px] text-slate-400">
                      {app.designation} · {app.upazilaName}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{app.destinationCountry}</div>
                    <div className="text-[11px] text-slate-400">{app.leavePurpose}</div>
                  </td>

                  <td className="py-3 px-3 text-center tabular-nums">
                    <div className="text-slate-200">
                      {toBengaliNumber(app.leaveStartDate)} হতে {toBengaliNumber(app.leaveEndDate)}
                    </div>
                    <div className="text-[11px] text-amber-400">
                      {toBengaliNumber(app.leaveDays)} দিন ({app.leaveDaysWords})
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center text-slate-300 tabular-nums">
                    {toBengaliNumber(app.applicationDate)}
                  </td>

                  <td className="py-3 px-3 text-center font-medium">
                    <span className={getStatusClass(app.status)}>{app.status}</span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrint(app)}
                        className="p-1.5 rounded-lg text-amber-300 hover:bg-amber-950/70 border border-amber-500/30 transition-colors cursor-pointer"
                        title="৬ পৃষ্ঠা সরাসরি প্রিন্ট করুন"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditApplication(app)}
                        className="p-1.5 rounded-lg text-blue-300 hover:bg-blue-950/60 border border-transparent hover:border-blue-700/50 transition-colors cursor-pointer"
                        title="ফর্মে সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(app)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 border border-transparent hover:border-rose-700/50 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(app)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/70 border border-emerald-600/30 transition-colors cursor-pointer"
                        title="৬ পৃষ্ঠার HTML ফাইল ডাউনলোড করুন"
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

      {/* Accessible In-App Delete Confirmation Modal (replaces window.confirm) */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 id="delete-modal-title" className="text-base font-bold text-white">
                আবেদনটি মুছে ফেলার নিশ্চিতকরণ
              </h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিত যে <span className="font-semibold text-white">&ldquo;{deleteTarget.applicantName}&rdquo;</span> ({deleteTarget.schoolName})-এর বহি:বাংলাদেশ ছুটি আবেদনটি তালিকা থেকে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteApplication(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
