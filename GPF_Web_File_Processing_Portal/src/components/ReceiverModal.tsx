import React, { useState } from 'react';
import { ReceiverPreset } from '../types';
import { X, Plus, Check, Trash2, Building } from 'lucide-react';

interface ReceiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onSelect: (value: string) => void;
  presets: ReceiverPreset[];
  onSavePresets: (presets: ReceiverPreset[]) => void;
}

export const ReceiverModal: React.FC<ReceiverModalProps> = ({
  isOpen,
  onClose,
  currentValue,
  onSelect,
  presets,
  onSavePresets,
}) => {
  const [selectedText, setSelectedText] = useState(currentValue);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleApply = (text: string) => {
    onSelect(text);
    onClose();
  };

  const handleAddPreset = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newPreset: ReceiverPreset = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
    };
    const updated = [...presets, newPreset];
    onSavePresets(updated);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('আপনি কি এই প্রাপক প্রিসেটটি মুছে ফেলতে চান?')) {
      const updated = presets.filter((p) => p.id !== id);
      onSavePresets(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/80">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">প্রাপক নির্বাচন ও মাল্টি ডাটা এন্ট্রি</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
          {/* Active Receiver Edit Box */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              বর্তমান নির্বাচিত প্রাপক (সরাসরি এডিটযোগ্য):
            </label>
            <textarea
              rows={4}
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              placeholder="প্রাপকের পদবী ও পূর্ণ ঠিকানা এখানে লিখুন..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm leading-relaxed"
            />
          </div>

          {/* Quick Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-300">
                সংরক্ষিত প্রাপক তালিকা (ক্লিক করে নির্বাচন করুন):
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 px-3 py-1.5 rounded-md flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন প্রাপক যোগ করুন</span>
              </button>
            </div>

            {/* Add New Preset Form */}
            {showAddForm && (
              <div className="bg-slate-800/80 border border-emerald-500/30 rounded-lg p-4 mb-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  নতুন প্রাপক প্রিসেট সংরক্ষণ
                </h4>
                <div>
                  <input
                    type="text"
                    placeholder="সহজ শিরোনাম (যেমন: উপজেলা শিক্ষা অফিসার, বিয়ানীবাজার)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    placeholder="পূর্ণ প্রাপক বিবরণ (বরাবরের পর যা বসবে)"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPreset}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold cursor-pointer"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {/* Presets List */}
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setSelectedText(preset.content)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between group ${
                    selectedText.trim() === preset.content.trim()
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold flex items-center space-x-2">
                      <span>{preset.title}</span>
                      {selectedText.trim() === preset.content.trim() && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-sm font-mono">
                          সক্রিয়
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 whitespace-pre-line pl-1 border-l-2 border-slate-700">
                      {preset.content}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleDeletePreset(preset.id, e)}
                      title="মুছুন"
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={() => handleApply(selectedText)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg flex items-center space-x-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>প্রাপক নিশ্চিত করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
