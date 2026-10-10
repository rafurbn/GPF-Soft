import React from 'react';
import { Lock, Unlock } from 'lucide-react';

interface LockToggleButtonProps {
  action: 'lock' | 'unlock';
  isLocked: boolean;
  onClick: () => void;
  title: string;
  id?: string;
  fullWidth?: boolean;
}

export const LockToggleButton: React.FC<LockToggleButtonProps> = ({
  action,
  isLocked,
  onClick,
  title,
  id,
  fullWidth = false,
}) => {
  const isDisabled = action === 'lock' ? isLocked : !isLocked;
  const Icon = action === 'lock' ? Lock : Unlock;

  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${
        isDisabled
          ? 'border-slate-700/70 bg-slate-800/70 text-slate-500'
          : 'border-emerald-800/60 bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/55 hover:text-emerald-100'
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{action === 'lock' ? 'লক' : 'আনলক'}</span>
    </button>
  );
};