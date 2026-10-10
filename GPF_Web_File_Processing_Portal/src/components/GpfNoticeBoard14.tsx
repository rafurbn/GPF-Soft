import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Calculator, 
  Calendar, 
  UserCheck, 
  FileCheck2, 
  FileText, 
  Stamp, 
  Lock, 
  Scale, 
  BookOpen, 
  Clock, 
  Banknote, 
  Search, 
  Printer, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  FileSpreadsheet,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GpfCondition, ActiveAppTab } from '../types';
import { GPF_14_CONDITIONS } from '../data/mockData';

interface GpfNoticeBoard14Props {
  onNavigateToApp?: (tab: ActiveAppTab) => void;
}

export const GpfNoticeBoard14: React.FC<GpfNoticeBoard14Props> = ({ onNavigateToApp }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');

  const categories = [
    { id: 'all', label: 'সকল শর্ত (১৪)' },
    { id: 'আইবাস++ ও হিসাব', label: 'আইবাস++ ও হিসাব' },
    { id: 'কর্তন ও মুনাফা', label: 'কর্তন ও মুনাফা' },
    { id: 'অগ্রিম ও যোগ্যতা', label: 'অগ্রিম ও যোগ্যতা' },
    { id: 'সনদ ও অডিট', label: 'সনদ ও অডিট' },
    { id: 'শাস্তি ও দায়বদ্ধতা', label: 'শাস্তি ও দায়বদ্ধতা' },
  ];

  const filteredConditions = GPF_14_CONDITIONS.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ruleRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number_bn.includes(searchQuery);
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Separate into 2 columns (left: 1-7, right: 8-14)
  const leftColumn = filteredConditions.filter(c => c.id <= 7);
  const rightColumn = filteredConditions.filter(c => c.id > 7);

  const handleCopy = (condition: GpfCondition) => {
    const textToCopy = `[শর্ত ${condition.number_bn}] ${condition.title}\n${condition.description}\nবিধি রেফারেন্স: ${condition.ruleRef}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(condition.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to render relevant icon
  const renderConditionIcon = (type: GpfCondition['iconType'], severity: GpfCondition['severity']) => {
    const iconClass = "w-5 h-5 shrink-0";
    switch (type) {
      case 'shield':
        return <ShieldAlert className={`${iconClass} text-rose-600`} />;
      case 'calculator':
        return <Calculator className={`${iconClass} text-indigo-600`} />;
      case 'banknote':
        return <Banknote className={`${iconClass} text-blue-600`} />;
      case 'clock':
        return <Clock className={`${iconClass} text-amber-600`} />;
      case 'user':
        return <UserCheck className={`${iconClass} text-rose-600`} />;
      case 'file-check':
        return <FileCheck2 className={`${iconClass} text-emerald-600`} />;
      case 'stamp':
        return <Stamp className={`${iconClass} text-rose-600`} />;
      case 'lock':
        return <Lock className={`${iconClass} text-amber-600`} />;
      case 'alert':
        return <AlertTriangle className={`${iconClass} text-rose-600`} />;
      case 'scale':
        return <Scale className={`${iconClass} text-purple-600`} />;
      case 'book':
        return <BookOpen className={`${iconClass} text-blue-600`} />;
      default:
        return severity === 'critical' ? (
          <AlertTriangle className={`${iconClass} text-rose-600`} />
        ) : (
          <Info className={`${iconClass} text-blue-600`} />
        );
    }
  };

  // Helper for card theme styling based on severity
  const getSeverityClasses = (severity: GpfCondition['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          cardBg: 'bg-rose-50/50 hover:bg-rose-50/80 border-rose-200 hover:border-rose-300',
          numberBadge: 'bg-rose-100 text-rose-800 border border-rose-300',
          indicator: 'bg-rose-500',
          tagText: 'text-rose-700 bg-rose-100/70',
          subtleBorder: 'border-rose-100'
        };
      case 'warning':
        return {
          cardBg: 'bg-amber-50/50 hover:bg-amber-50/80 border-amber-200 hover:border-amber-300',
          numberBadge: 'bg-amber-100 text-amber-800 border border-amber-300',
          indicator: 'bg-amber-500',
          tagText: 'text-amber-700 bg-amber-100/70',
          subtleBorder: 'border-amber-100'
        };
      case 'regulatory':
        return {
          cardBg: 'bg-indigo-50/40 hover:bg-indigo-50/70 border-indigo-200 hover:border-indigo-300',
          numberBadge: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
          indicator: 'bg-indigo-500',
          tagText: 'text-indigo-700 bg-indigo-100/70',
          subtleBorder: 'border-indigo-100'
        };
      case 'info':
      default:
        return {
          cardBg: 'bg-sky-50/40 hover:bg-sky-50/70 border-sky-200 hover:border-sky-300',
          numberBadge: 'bg-sky-100 text-sky-800 border border-sky-300',
          indicator: 'bg-sky-500',
          tagText: 'text-sky-700 bg-sky-100/70',
          subtleBorder: 'border-sky-100'
        };
    }
  };

  // Condition Card Renderer
  const renderCard = (condition: GpfCondition) => {
    const styling = getSeverityClasses(condition.severity);
    const isExpanded = viewMode === 'expanded' || expandedCardId === condition.id;

    return (
      <div 
        key={condition.id}
        className={`relative rounded-xl border p-4 sm:p-4.5 transition-all duration-200 shadow-xs hover:shadow-sm ${styling.cardBg} flex flex-col justify-between`}
      >
        {/* Top bar of card */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              {/* Number Badge */}
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm tracking-tight shrink-0 shadow-2xs ${styling.numberBadge}`}>
                {condition.number_bn}
              </span>
              
              {/* Icon Container */}
              <div className="p-1 rounded-md bg-white/90 border border-slate-200/60 shadow-2xs">
                {renderConditionIcon(condition.iconType, condition.severity)}
              </div>

              {/* Category tag */}
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${styling.tagText}`}>
                {condition.category}
              </span>
            </div>

            {/* Quick Actions (Copy & Expand) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopy(condition)}
                title="শর্ত কপি করুন"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-md transition cursor-pointer"
              >
                {copiedId === condition.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2">
            {condition.title}
          </h3>

          {/* Core Description */}
          <p className="text-slate-700 text-sm leading-relaxed mb-3">
            {condition.description}
          </p>

          {/* Expanded / Accordion View */}
          {isExpanded && (
            <div className={`mt-2 pt-2.5 border-t ${styling.subtleBorder} text-xs text-slate-600 space-y-2 bg-white/70 rounded-lg p-2.5`}>
              <div>
                <strong className="text-slate-800 block mb-1">বিধিবদ্ধ ব্যাখ্যা ও করণীয়:</strong>
                <p className="leading-normal">{condition.details}</p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 pt-1 border-t border-slate-100">
                <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                <span>বিধি ও আইনগত রেফারেন্স: <span className="font-semibold text-slate-700">{condition.ruleRef}</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-[210px] text-[11px] text-slate-500 font-mono">
            {condition.ruleRef}
          </span>
          {viewMode !== 'expanded' && (
            <button
              type="button"
              onClick={() => setExpandedCardId(expandedCardId === condition.id ? null : condition.id)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer ml-auto"
            >
              {expandedCardId === condition.id ? (
                <>
                  <span>সংক্ষেপ করুন</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>বিস্তারিত নিয়ম</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section aria-labelledby="gpf-rules-title" className="space-y-6">
      {/* Notice Board Header Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Visual Accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-indigo-600 to-amber-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-700" />
                <span>সরকারি বিধিমালা ও হিসাবরক্ষণ নিরীক্ষা</span>
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 hidden sm:inline">বাংলাদেশ ফরম নং-২৮৫৫</span>
            </div>
            
            <h1 id="gpf-rules-title" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              জিপিএফ ফাইল প্রসেসিং ও ব্যবহারের ১৪টি সতর্কতামূলক শর্তাবলী
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-3xl">
              উপজেলা প্রাথমিক শিক্ষা অফিসের শিক্ষক ও কর্মচারীদের জিপিএফ হিসাব, ফেরতযোগ্য ও অফেরতযোগ্য অগ্রিম এবং চূড়ান্ত উত্তোলন ফাইল অনুমোদনে নিম্নবর্ণিত ১৪টি শর্ত কঠোরভাবে প্রতিপালন আবশ্যক।
            </p>
          </div>

          {/* Action buttons (Print & View Toggle) */}
          <div className="flex items-center gap-2 no-print shrink-0">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'compact' ? 'expanded' : 'compact')}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {viewMode === 'compact' ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>সব শর্ত সম্প্রসারণ করুন</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  <span>সংক্ষিপ্ত ভিউ</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / নোটিশ কপি</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শর্ত বা বিধি অনুসন্ধান..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Grid Layout for 14 Conditions */}
      {filteredConditions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-medium text-slate-700">কোনো সতর্কতামূলক শর্ত খুঁজে পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            সব শর্ত পুনরায় প্রদর্শন করুন
          </button>
        </div>
      ) : selectedCategory !== 'all' || searchQuery ? (
        // When filtered, display as standard responsive 2-column grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConditions.map(renderCard)}
        </div>
      ) : (
        // Standard View: Strict Two-column Grid (Left 7, Right 7)
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column (শর্ত ০১ থেকে ০৭) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-200 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5 text-slate-900">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>বাম পাশ: সাধারণ প্রাক-যোগ্যতা ও হিসাবরক্ষণ শর্তাবলী (০১ - ০৭)</span>
              </span>
              <span className="font-mono text-slate-400">৭টি শর্ত</span>
            </div>
            <div className="space-y-3.5">
              {leftColumn.map(renderCard)}
            </div>
          </div>

          {/* Right Column (শর্ত ০৮ থেকে ১৪) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-200 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5 text-slate-900">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>ডান পাশ: অফিস অনুমোদন, বৈধতা ও আইনগত শর্তাবলী (০৮ - ১৪)</span>
              </span>
              <span className="font-mono text-slate-400">৭টি শর্ত</span>
            </div>
            <div className="space-y-3.5">
              {rightColumn.map(renderCard)}
            </div>
          </div>
        </div>
      )}

      {/* Compliance Acknowledgement & Quick Module Navigation Footer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acknowledge-terms"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="acknowledge-terms" className="text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
              <strong className="text-slate-900">অঙ্গীকারনামা:</strong> আমি উপজেলা প্রাথমিক শিক্ষা অফিসের দায়িত্বশীল কর্মকর্তা/ব্যবহারকারী হিসেবে উল্লেখিত <strong>১৪টি সতর্কতামূলক শর্তাবলী</strong> যথাযথভাবে পাঠ করেছি। জিপিএফ ফাইল প্রসেসিং এবং অর্থ উত্তোলনের ক্ষেত্রে আমি সরকারি আর্থিক বিধিমালার কোনো শর্ত লঙ্ঘন করব না।
            </label>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {acknowledged ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>শর্তাবলীতে সম্মত হয়েছেন</span>
              </span>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 font-medium">
                টিক দিয়ে সম্মতি নিশ্চিত করুন
              </span>
            )}
          </div>
        </div>

        {/* Quick Launchpad to GPF Applications */}
        {onNavigateToApp && (
          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 mb-2 font-medium">
              শর্তাবলী পর্যালোচনা শেষে ফাইল প্রস্তুত করতে সরাসরি অ্যাপে প্রবেশ করুন:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateToApp('gpf_refundable')}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-xs font-semibold transition cursor-pointer group"
              >
                <span>১. ফেরতযোগ্য অগ্রিম আবেদন</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </button>
              
              <button
                type="button"
                onClick={() => onNavigateToApp('gpf_non_refundable')}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800 text-xs font-semibold transition cursor-pointer group"
              >
                <span>২. অফেরতযোগ্য অগ্রিম আবেদন</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToApp('gpf_final')}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-slate-800 text-xs font-semibold transition cursor-pointer group"
              >
                <span>৩. জিপিএফ চূড়ান্ত নিষ্পত্তি</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
