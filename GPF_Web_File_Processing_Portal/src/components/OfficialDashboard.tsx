import React from 'react';
import { BookmarkCheck, Sparkles, ChevronRight } from 'lucide-react';

export default function DashboardGrid() {
  // আপনার ৩টি সক্রিয় এ্যাপ
  const apps = [
    {
      id: 'app1',
      no: '১',
      title: 'ফেরতযোগ্য অগ্রিম উত্তোলন',
      badge: '১২-৪৮ কিস্তি',
      badgeColor: 'emerald',
      desc: 'স্বয়ংক্রিয় কিস্তি হিসাব, অগ্রিম মঞ্জুরি ও আইবাস++ শিডিউল ফরম',
      url: '/app1/index.html',
      isActive: true,
    },
    {
      id: 'app2',
      no: '২',
      title: 'অফেরতযোগ্য অগ্রিম উত্তোলন',
      badge: 'বয়স ৫২ / ২৫ বছর',
      badgeColor: 'teal',
      desc: 'বয়স ৫২ বছর বা ২৫ বছর চাকরিকালীন অফেরতযোগ্য স্থায়ী মঞ্জুরি',
      url: '/app2/index.html',
      isActive: true,
    },
    {
      id: 'app3',
      no: '৩',
      title: 'চূড়ান্ত উত্তোলন ও নো-ডিমান্ড',
      badge: 'PRL ও দায়মুক্তি',
      badgeColor: 'cyan',
      desc: 'অবসরকালীন (PRL) চূড়ান্ত স্থিতি নিষ্পত্তি ও নো-ডিমান্ড প্রত্যয়ন',
      url: '/app3/index.html',
      isActive: true,
    },
    // বাকি ৩টি খালি স্লট (ভবিষ্যতের জন্য)
    { id: 'app4', no: '৪', isActive: false },
    { id: 'app5', no: '৫', isActive: false },
    { id: 'app6', no: '৬', isActive: false },
  ];

  const handleAppClick = (url) => {
    if (url) {
      window.location.href = url; // সরাসরি আপনার আসল এ্যাপ ওপেন হবে
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a121e]/90 rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl">
      {/* ব্যানার: এই পোর্টালে আপনাকে স্বাগতম */}
      <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#091e23]/80 via-[#0a1b24]/60 to-[#091522]/80 border border-emerald-600/40 mb-6 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-[#0a1e22] border border-emerald-500/70 flex items-center justify-center flex-shrink-0 text-emerald-400">
          <BookmarkCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-white">
          এই পোর্টালে আপনাকে স্বাগতম
        </h2>
      </div>

      {/* টাইটেল */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm sm:text-base font-bold text-slate-100">
          জিপিএফ ফাইল প্রসেসিং এ্যাপসমূহ:
        </h3>
      </div>

      {/* ২-কলামের গ্রিড (৩টি সচল বাটন + ৩টি খালি স্লট) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {apps.map((app) => {
          if (app.isActive) {
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleAppClick(app.url)}
                className="group w-full text-left p-4 rounded-2xl bg-[#0d1829]/90 hover:bg-[#112036] border border-slate-800/80 hover:border-emerald-600/70 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* নম্বর ব্যাজ */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border mt-0.5 bg-emerald-950/70 border-emerald-700/60 text-emerald-400 group-hover:border-emerald-400">
                    {app.no}
                  </div>

                  {/* এ্যাপের বিবরণ */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm sm:text-[15px] text-white group-hover:text-emerald-300">
                        {app.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        {app.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2">
                      {app.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            );
          }

          // ৩টি খালি স্লট (ভবিষ্যতের এ্যাপের জন্য)
          return (
            <div
              key={app.id}
              className="w-full min-h-[96px] rounded-2xl bg-[#09121f]/50 border border-slate-800/50 flex items-center justify-center text-slate-600 select-none"
            >
              <span className="text-xs font-mono text-slate-600">
                [ এ্যাপ স্লট {app.no} • সংরক্ষিত ]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
