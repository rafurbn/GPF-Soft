import React from 'react';
import { ShieldCheck, Users, KeyRound, Building2, FileCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { UserSession, GpfApplication } from '../types';

interface SuperAdminOverviewProps {
  users: UserSession[];
  gpfApplications: GpfApplication[];
  onResetPassword: (upazilaCode: string) => void;
}

export const SuperAdminOverview: React.FC<SuperAdminOverviewProps> = ({
  users,
  gpfApplications,
  onResetPassword,
}) => {
  return (
    <div className="space-y-6">
      {/* Super Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold border border-purple-400/30">
              সুপার এডমিন কন্ট্রোল প্যানেল
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            সার্বিক প্রশাসনিক ও উপজেলা পর্যবেক্ষণ হাব
          </h2>
          <p className="text-xs text-purple-200 mt-1 max-w-2xl">
            প্রধান তত্ত্বাবধায়ক: <strong>রফিকুল ইসলাম</strong> • দেশের সকল উপজেলার জিপিএফ ফাইল প্রসেসিং, সিকিউরিটি পলিসি ও ইউজার ক্রেডেনশিয়াল ম্যানেজমেন্ট।
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-xs text-center shrink-0">
          <div className="text-2xl font-bold font-mono text-purple-200">
            {users.filter(u => u.role !== 'super_admin').length}
          </div>
          <div className="text-purple-300 text-[11px] mt-0.5">নিবন্ধিত উপজেলা</div>
        </div>
      </div>

      {/* Upazila User Accounts Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <span>উপজেলা শিক্ষা অফিস অ্যাকাউন্ট ও পাসওয়ার্ড নিয়ন্ত্রণ</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-semibold">
              <tr>
                <th className="p-3">উপজেলা ও কোড</th>
                <th className="p-3">অফিসিয়াল ইমেইল</th>
                <th className="p-3">জেলা</th>
                <th className="p-3">প্রথম লগইন স্ট্যাটাস</th>
                <th className="p-3">সর্বশেষ কার্যক্রম</th>
                <th className="p-3 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-800">
                    {u.upazila_name_bn} ({u.upazila_code})
                  </td>
                  <td className="p-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="p-3 text-slate-600">{u.district_name_bn}</td>
                  <td className="p-3">
                    {u.is_first_login ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                        পাসওয়ার্ড রিসেট আবশ্যক
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        নিরাপদ ও সক্রিয়
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500">{u.last_login}</td>
                  <td className="p-3 text-right">
                    {u.role !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => onResetPassword(u.upazila_code)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>রিসেট পাসওয়ার্ড</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
