import React, { useMemo, useState } from 'react';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Banknote,
  Clock,
  UserCheck,
  FileCheck2,
  Stamp,
  Lock,
  AlertTriangle,
  Scale,
  BookOpen,
  Info,
  FileSpreadsheet,
  FileText,
  Award,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Building2,
  Copy,
  Check,
  TrendingUp,
  Printer,
  ChevronDown,
  ChevronUp,
  KeyRound,
} from 'lucide-react';
import type { GpfCondition, GpfConditionCategory, UserSession, ActiveAppTab } from '../types';
import { GPF_14_CONDITIONS } from '../data/mockData';

interface Dashboard14Props {
  currentUser: UserSession | null;
  isDemoSession?: boolean;
  onNavigateToApp: (tab: ActiveAppTab) => void;
  onOpenPasswordModal?: () => void;
}

// The five official register categories the 14 conditions roll up into.
type CategoryStat = { key: GpfConditionCategory; label: string; accent: string; bar: string; text: string; chip: string };

const CATEGORY_META: CategoryStat[] = [
  { key: 'আইবাস++ ও হিসাব', label: 'আইবাস++ ও হিসাব', accent: 'bg-sky-500', bar: 'bg-sky-500', text: 'text-sky-300', chip: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  { key: 'কর্তন ও মুনাফা', label: 'কর্তন ও মুনাফা', accent: 'bg-indigo-500', bar: 'bg-indigo-500', text: 'text-indigo-300', chip: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
  { key: 'অগ্রিম ও যোগ্যতা', label: 'অগ্রিম ও যোগ্যতা', accent: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-300', chip: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  { key: 'সনদ ও অডিট', label: 'সনদ ও অডিট', accent: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-300', chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  { key: 'শাস্তি ও দায়বদ্ধতা', label: 'শাস্তি ও দায়বদ্ধতা', accent: 'bg-rose-500', bar: 'bg-rose-500', text: 'text-rose-300', chip: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
];

// Severity => visual tokens (dark, modern dashboard palette).
const SEVERITY_META: Record<
  GpfCondition['severity'],
  { dot: string; badge: string; iconWrap: string; ring: string; label: string; hex: string }
> = {
  critical: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    iconWrap: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    ring: 'group-hover:border-rose-500/50',
    label: 'অতি গুরুত্বপূর্ণ',
    hex: '#f43f5e',
  },
  warning: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    iconWrap: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ring: 'group-hover:border-amber-500/50',
    label: 'সতর্কতামূলক',
    hex: '#f59e0b',
  },
  regulatory: {
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    iconWrap: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ring: 'group-hover:border-indigo-500/50',
    label: 'বিধিগত',
    hex: '#6366f1',
  },
  info: {
    dot: 'bg-sky-500',
    badge: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    iconWrap: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    ring: 'group-hover:border-sky-500/50',
    label: 'তথ্যমূলক',
    hex: '#0ea5e9',
  },
};

const renderConditionIcon = (type: GpfCondition['iconType']) => {
  const cls = 'w-5 h-5';
  switch (type) {
    case 'shield':
      return <ShieldCheck className={cls} />;
    case 'calculator':
      return <Calculator className={cls} />;
    case 'banknote':
      return <Banknote className={cls} />;
    case 'clock':
      return <Clock className={cls} />;
    case 'user':
      return <UserCheck className={cls} />;
    case 'file-check':
      return <FileCheck2 className={cls} />;
    case 'stamp':
      return <Stamp className={cls} />;
    case 'lock':
      return <Lock className={cls} />;
    case 'alert':
      return <AlertTriangle className={cls} />;
    case 'scale':
      return <Scale className={cls} />;
    case 'book':
      return <BookOpen className={cls} />;
    default:
      return <Info className={cls} />;
  }
};

/**
 * The post-login dashboard for the 14 GPF processing conditions.
 *
 * Replaces the old flat bullet list with a modern analytics console:
 *   - KPI stat tiles (total rules, category count, critical count, coverage)
 *   - a pure-SVG donut chart of rules per category
 *   - per-category progress bars
 *   - a searchable / filterable condition grid with expandable detail
 */
export const Dashboard14: React.FC<Dashboard14Props> = ({
  currentUser,
  isDemoSession = false,
  onNavigateToApp,
  onOpenPasswordModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | GpfConditionCategory>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const total = GPF_14_CONDITIONS.length;

  const categoryCounts = useMemo(
    () =>
      CATEGORY_META.map((meta) => ({
        ...meta,
        count: GPF_14_CONDITIONS.filter((c) => c.category === meta.key).length,
      })),
    [],
  );

  const criticalCount = useMemo(
    () => GPF_14_CONDITIONS.filter((c) => c.severity === 'critical').length,
    [],
  );

  const filteredConditions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return GPF_14_CONDITIONS.filter((c) => {
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesSearch =
        !term ||
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.details.toLowerCase().includes(term) ||
        c.ruleRef.toLowerCase().includes(term) ||
        c.number_bn.includes(term) ||
        c.category.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleCopy = (condition: GpfCondition) => {
    const textToCopy = `[শর্ত ${condition.number_bn}] ${condition.title}\n${condition.description}\nবিধি রেফারেন্স: ${condition.ruleRef}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(condition.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  // ---- Donut chart geometry (pure SVG, no chart library) ------------------
  const donut = useMemo(() => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const segments = categoryCounts.map((c) => {
      const fraction = c.count / total;
      const length = fraction * circumference;
      const seg = { ...c, dash: `${length} ${circumference - length}`, offset: -offset };
      offset += length;
      return seg;
    });
    return { radius, circumference, segments };
  }, [categoryCounts, total]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ===================== UPAZILA SETTINGS STRIP ===================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-900/50 p-4 sm:p-5 shadow-lg">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentUser?.upazila_name_bn || 'উপজেলা অফিস'}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDemoSession
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isDemoSession ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                  {isDemoSession ? 'ডেমো সেশন' : 'সক্রিয় সেশন'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                উপজেলা প্রাথমিক শিক্ষা অফিসারের কার্যালয় • {currentUser?.district_name_bn || '—'} জেলা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">উপজেলা কোড</div>
              <div className="text-sm font-bold font-mono text-emerald-400">{currentUser?.upazila_code || '—'}</div>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">ইউজার রোল</div>
              <div className="text-sm font-bold text-emerald-400">
                {currentUser?.role === 'super_admin' ? 'প্রধান এডমিন' : 'অনুমোদিত'}
              </div>
            </div>
            {onOpenPasswordModal && (
              <button
                type="button"
                onClick={onOpenPasswordModal}
                title="পাসওয়ার্ড পরিবর্তন"
                className="rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:text-amber-300 text-slate-300 p-3 transition cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================== KPI STAT TILES ===================== */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatTile
          icon={<ListChecks className="w-5 h-5" />}
          label="মোট শর্তাবলী"
          value={`${total}`}
          sub="সরকারি বিধিমালা ভিত্তিক"
          tone="emerald"
        />
        <StatTile
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="বিভাগসমূহ"
          value={`${CATEGORY_META.length}`}
          sub="হিসাব ও অডিট শ্রেণি"
          tone="sky"
        />
        <StatTile
          icon={<AlertTriangle className="w-5 h-5" />}
          label="অতি গুরুত্বপূর্ণ"
          value={`${criticalCount}`}
          sub="লঙ্ঘনে ফাইল বাতিল"
          tone="rose"
        />
        <StatTile
          icon={<TrendingUp className="w-5 h-5" />}
          label="বিধি কভারেজ"
          value={`${Math.round((criticalCount / total) * 100)}%`}
          sub="কঠোর আনুগত্য প্রয়োজন"
          tone="amber"
        />
      </div>

      {/* ===================== ANALYTICS + CATEGORY BREAKDOWN ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Donut chart */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg">
          <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>বিভাগভিত্তিক বিধি বণ্টন</span>
          </h4>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg viewBox="0 0 140 140" className="w-36 h-36 -rotate-90">
                <circle cx="70" cy="70" r={donut.radius} fill="none" stroke="#1e293b" strokeWidth="14" />
                {donut.segments.map((seg) => (
                  <circle
                    key={seg.key}
                    cx="70"
                    cy="70"
                    r={donut.radius}
                    fill="none"
                    stroke={SEVERITY_META[GPF_14_CONDITIONS.find((c) => c.category === seg.key)!.severity].hex}
                    strokeWidth="14"
                    strokeDasharray={seg.dash}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="butt"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none">{total}</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">মোট শর্ত</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {categoryCounts.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 text-slate-300 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.accent}`} />
                    <span className="truncate">{c.label}</span>
                  </span>
                  <span className={`font-mono font-bold shrink-0 ${c.text}`}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category progress bars */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg">
          <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>বিভাগভিত্তিক শর্ত কভারেজ</span>
          </h4>
          <div className="space-y-3.5">
            {categoryCounts.map((c) => (
              <div key={c.key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">{c.label}</span>
                  <span className="text-slate-500 font-mono">
                    {c.count}/{total} • {Math.round((c.count / total) * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                    style={{ width: `${(c.count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== CONDITION EXPLORER ===================== */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>১৪টি সতর্কতামূলক শর্তাবলী — বিধি এক্সপ্লোরার</span>
            </h4>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / নোটিশ কপি</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
            {/* Category chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <FilterChip
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                label={`সকল (${total})`}
              />
              {categoryCounts.map((c) => (
                <FilterChip
                  key={c.key}
                  active={selectedCategory === c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  label={`${c.label} (${c.count})`}
                />
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="শর্ত বা বিধি অনুসন্ধান..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="p-4 sm:p-5">
          {filteredConditions.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-medium text-slate-400">কোনো শর্ত খুঁজে পাওয়া যায়নি</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
              >
                সব শর্ত পুনরায় প্রদর্শন করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
              {filteredConditions.map((condition) => {
                const sev = SEVERITY_META[condition.severity];
                const meta = CATEGORY_META.find((c) => c.key === condition.category)!;
                const isExpanded = expandedId === condition.id;
                return (
                  <div
                    key={condition.id}
                    className={`group relative rounded-xl bg-slate-950/60 border border-slate-800 ${sev.ring} p-4 transition-all duration-200 hover:bg-slate-900/80 hover:shadow-lg`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0 border ${meta.chip}`}>
                          {condition.number_bn}
                        </span>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${sev.iconWrap}`}>
                          {renderConditionIcon(condition.iconType)}
                        </span>
                        <span className={`hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.chip}`}>
                          {condition.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(condition)}
                        title="শর্ত কপি করুন"
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition cursor-pointer shrink-0 no-print"
                      >
                        {copiedId === condition.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Title */}
                    <h5 className="text-sm font-bold text-white leading-snug tracking-tight mb-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${sev.dot} mr-2 align-middle`} />
                      {condition.title}
                    </h5>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed">{condition.description}</p>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                        <div>
                          <strong className="text-slate-200 block mb-1">বিধিবদ্ধ ব্যাখ্যা ও করণীয়:</strong>
                          <p className="text-slate-400 leading-relaxed">{condition.details}</p>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-500 pt-2 border-t border-slate-800/70">
                          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>
                            বিধি রেফারেন্স:{' '}
                            <span className="font-semibold text-slate-300">{condition.ruleRef}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sev.badge}`}>{sev.label}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : condition.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-emerald-300 transition cursor-pointer no-print"
                      >
                        {isExpanded ? (
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Result count bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>
              প্রদর্শিত হচ্ছে <strong className="text-slate-300">{filteredConditions.length}</strong> / {total} টি শর্ত
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              সর্বশেষ সরকারি প্রজ্ঞাপন ও বিধিমালা অনুযায়ী হালনাগাদকৃত
            </span>
          </div>
        </div>
      </div>

      {/* ===================== APP LAUNCHPAD ===================== */}
      <div className="no-print">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>জিপিএফ ফাইল প্রসেসিং এ্যাপসমূহ</span>
          </h4>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
            ৩টি এ্যাপ প্রস্তুত
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LaunchCard
            index="১"
            title="ফেরতযোগ্য অগ্রিম উত্তোলন"
            desc="কিস্তি হিসাব, অগ্রিম মঞ্জুরি ও আইবাস++ শিডিউল"
            tone="emerald"
            onClick={() => onNavigateToApp('gpf_refundable')}
          />
          <LaunchCard
            index="২"
            title="অফেরতযোগ্য অগ্রিম উত্তোলন"
            desc="বয়স ৫২ / ২৫ বছর চাকরিকালীন স্থায়ী মঞ্জুরি"
            tone="amber"
            onClick={() => onNavigateToApp('gpf_non_refundable')}
          />
          <LaunchCard
            index="৩"
            title="চূড়ান্ত উত্তোলন ও নো-ডিমান্ড"
            desc="PRL চূড়ান্ত স্থিতি নিষ্পত্তি ও প্রত্যয়ন"
            tone="sky"
            onClick={() => onNavigateToApp('gpf_final')}
          />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------
const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: 'emerald' | 'sky' | 'rose' | 'amber';
}> = ({ icon, label, value, sub, tone }) => {
  const tones: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 shadow-lg hover:border-slate-700 transition">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-2.5 ${tones[tone]}`}>{icon}</div>
      <div className="text-2xl font-black text-white leading-none">{value}</div>
      <div className="text-xs font-semibold text-slate-300 mt-1.5">{label}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
};

const FilterChip: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition cursor-pointer ${active
        ? 'bg-emerald-600 text-white shadow-xs'
        : 'bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700 hover:text-white'
      }`}
  >
    {label}
  </button>
);

const LaunchCard: React.FC<{
  index: string;
  title: string;
  desc: string;
  tone: 'emerald' | 'amber' | 'sky';
  onClick: () => void;
}> = ({ index, title, desc, tone, onClick }) => {
  const tones: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 group-hover:border-emerald-500/60',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30 group-hover:border-amber-500/60',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30 group-hover:border-sky-500/60',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-xl bg-slate-900/70 border border-slate-800 hover:bg-slate-800/70 p-4 transition-all duration-200 cursor-pointer shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-lg font-mono shrink-0 transition ${tones[tone]}`}>
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-sm text-white group-hover:text-emerald-200 transition leading-snug">{title}</h5>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{desc}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0" />
      </div>
    </button>
  );
};
