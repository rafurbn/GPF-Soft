import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  text: string;
  kind: ToastKind;
}

const TONE: Record<ToastKind, string> = {
  success: 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50',
  error: 'bg-rose-950/95 text-rose-200 border-rose-500/50',
  info: 'bg-sky-950/95 text-sky-200 border-sky-500/50',
  warning: 'bg-amber-950/95 text-amber-200 border-amber-500/50',
};

const ICON: Record<ToastKind, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

/** The single toast surface: bottom-right, above the sticky header. */
export const Toast: React.FC<{ toast: ToastMessage | null }> = ({ toast }) => {
  if (!toast) return null;
  const Icon = ICON[toast.kind];
  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[60] flex max-w-[92vw] items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl text-sm font-semibold print:hidden ${TONE[toast.kind]}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{toast.text}</span>
    </div>
  );
};

/** One show/dismiss/timer contract for all four apps (they used to differ). */
export const useToast = (durationMs = 3500) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const showToast = useCallback(
    (text: string, kind: ToastKind = 'success') => {
      window.clearTimeout(timer.current);
      setToast({ text, kind });
      timer.current = window.setTimeout(() => setToast(null), durationMs);
    },
    [durationMs]
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { toast, showToast };
};
