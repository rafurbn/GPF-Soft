import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, Info, Bell, X, Sparkles } from 'lucide-react';
import { getActiveAnnouncementsForUser, hydrateAnnouncements } from '../lib/centralAdminStore';
import type { SystemAnnouncement } from '../types';

interface BroadcastNoticeMarqueeProps {
  userUpazilaCode?: string;
}

export const BroadcastNoticeMarquee: React.FC<BroadcastNoticeMarqueeProps> = ({ userUpazilaCode }) => {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await hydrateAnnouncements(userUpazilaCode);
        if (active) setAnnouncements(list);
      } catch {
        if (active) setAnnouncements(getActiveAnnouncementsForUser(userUpazilaCode));
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [userUpazilaCode]);

  if (isDismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex] || announcements[0];

  return (
    <div
      className={`w-full py-2.5 px-4 mb-4 rounded-2xl border shadow-lg flex items-center justify-between gap-3 text-xs transition-all duration-300 animate-fade-in ${
        current.severity === 'critical'
          ? 'bg-rose-950/80 border-rose-700/80 text-rose-100 shadow-rose-950/40'
          : current.severity === 'warning'
          ? 'bg-amber-950/80 border-amber-700/80 text-amber-100 shadow-amber-950/40'
          : 'bg-indigo-950/80 border-indigo-700/80 text-indigo-100 shadow-indigo-950/40'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
            current.severity === 'critical'
              ? 'bg-rose-900 border-rose-600 text-rose-200'
              : current.severity === 'warning'
              ? 'bg-amber-900 border-amber-600 text-amber-200'
              : 'bg-indigo-900 border-indigo-600 text-indigo-200'
          }`}
        >
          {current.severity === 'critical' ? (
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          ) : (
            <Radio className="w-4 h-4 animate-pulse" />
          )}
        </span>

        <div className="min-w-0 flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white uppercase text-[11px] tracking-wide">
            [{current.title}]:
          </span>
          <span className="text-slate-200 font-medium truncate sm:whitespace-normal">
            {current.message}
          </span>
          {current.targetUpazilaName && (
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/10 text-white/90 border border-white/20 font-mono">
              প্রাপক: {current.targetUpazilaName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {announcements.length > 1 && (
          <button
            type="button"
            onClick={() => setCurrentIndex((currentIndex + 1) % announcements.length)}
            className="text-[10px] font-mono px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer"
            title="পরবর্তী নোটিশ দেখুন"
          >
            {currentIndex + 1}/{announcements.length} &rarr;
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
          title="নোটিশ বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
