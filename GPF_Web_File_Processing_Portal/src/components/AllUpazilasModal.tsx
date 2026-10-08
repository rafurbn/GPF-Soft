import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  getAllUpazilas,
  getAllDivisions,
  getDistrictsByDivision,
  filterUpazilas,
  UpazilaRecord,
} from '../data/upazilaData';

interface AllUpazilasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUpazila: (upazila: UpazilaRecord) => void;
  selectedDefaultId?: string;
}

export const AllUpazilasModal: React.FC<AllUpazilasModalProps> = ({
  isOpen,
  onClose,
  onSelectUpazila,
  selectedDefaultId,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allUpazilas = useMemo(() => getAllUpazilas(), []);
  const divisions = useMemo(() => getAllDivisions(), []);

  const availableDistricts = useMemo(() => {
    return getDistrictsByDivision(selectedDivision);
  }, [selectedDivision]);

  // Handle division change and reset district if not in new division
  const handleDivisionChange = (divEn: string) => {
    setSelectedDivision(divEn);
    setSelectedDistrict('ALL');
  };

  // Filtered upazilas
  const filteredList = useMemo(() => {
    return filterUpazilas({
      division: selectedDivision,
      district: selectedDistrict,
      query: searchQuery,
    });
  }, [selectedDivision, selectedDistrict, searchQuery]);

  // Counts per division
  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allUpazilas.length };
    allUpazilas.forEach((u) => {
      counts[u.division] = (counts[u.division] || 0) + 1;
    });
    return counts;
  }, [allUpazilas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-4xl h-[90vh] max-h-[750px] rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-indigo-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-wide text-white">
                  বাংলাদেশের সকল উপজেলা ও ডিফল্ট আইডি তালিকা
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  সর্বমোট ৫০৪টি
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                সকল বিভাগ, জেলা ও উপজেলার নির্ধারিত ডিফল্ট আইডি তালিকা থেকে সরাসরি নির্বাচন করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          {/* Search bar & District filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="উপজেলা (যেমন: বিয়ানীবাজার), জেলা বা ডিফল্ট আইডি (যেমন: Bea002) দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 shadow-2xs"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* District Filter Dropdown */}
            <div className="sm:col-span-4 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 shadow-2xs text-slate-800 font-medium"
              >
                <option value="ALL">সকল জেলা ({availableDistricts.length}টি)</option>
                {availableDistricts.map((d) => (
                  <option key={d.en} value={d.en}>
                    {d.bn} ({d.en})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Division Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              বিভাগ:
            </span>
            <button
              type="button"
              onClick={() => handleDivisionChange('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedDivision === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              সব বিভাগ ({divisionCounts.ALL})
            </button>
            {divisions.map((div) => {
              const isActive = selectedDivision === div.en;
              const count = divisionCounts[div.en] || 0;
              return (
                <button
                  key={div.en}
                  type="button"
                  onClick={() => handleDivisionChange(div.en)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {div.bn} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2 bg-slate-100/80 border-b border-slate-200 text-xs flex items-center justify-between text-slate-600 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <span>প্রদর্শিত উপজেলা:</span>
            <strong className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {filteredList.length}টি
            </strong>
            <span className="text-slate-400">(সর্বমোট ৫০৪টি থেকে)</span>
          </div>
          {(selectedDivision !== 'ALL' || selectedDistrict !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedDivision('ALL');
                setSelectedDistrict('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              ফিল্টার রিসেট করুন
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
          {filteredList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Building2 className="w-12 h-12 text-slate-300 mb-2" />
              <div className="font-bold text-slate-700 text-sm">কোনো উপজেলা খুঁজে পাওয়া যায়নি</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                অন্য কোনো বানান বা ইংরেজি/বাংলা নাম লিখে চেষ্টা করুন অথবা ফিল্টার পরিবর্তন করুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDivision('ALL');
                  setSelectedDistrict('ALL');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700"
              >
                সকল ৫০৪টি উপজেলা দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredList.map((item) => {
                const isSelected = selectedDefaultId?.toLowerCase() === item.defaultId.toLowerCase();
                return (
                  <div
                    key={`${item.defaultId}-${item.district}-${item.upazila}`}
                    onClick={() => {
                      onSelectUpazila(item);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/30'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-900 text-sm">
                          {item.upazilaBn}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({item.upazila})
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> বর্তমান
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          জেলা: <strong className="text-slate-700 font-semibold">{item.districtBn}</strong>
                        </span>
                        <span>•</span>
                        <span>বিভাগ: <strong className="text-slate-700 font-semibold">{item.divisionBn}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-semibold text-slate-400">ডিফল্ট আইডি</div>
                        <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 group-hover:bg-indigo-700 group-hover:text-white transition shadow-2xs inline-block">
                          {item.defaultId}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white border-t border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 shrink-0">
          <div className="text-[11px]">
            যে কোনো উপজেলার উপর ক্লিক করলেই স্বয়ংক্রিয়ভাবে তার ডিফল্ট আইডি সাইন-ইন বক্সে সেট হবে।
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
