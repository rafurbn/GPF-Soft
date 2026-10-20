import { useCallback } from 'react';
import type { CSSProperties, SyntheticEvent } from 'react';
import type { ToastKind } from './Toast';
import { LOCKED_FIELD_TOAST } from './tokens';

/** The red round notice shown when a locked field is clicked. */
export const useLockedFieldNotice = (
  showToast: (text: string, kind?: ToastKind) => void
) =>
  useCallback(
    (label: string) => showToast(LOCKED_FIELD_TOAST.replace('{label}', label), 'error'),
    [showToast]
  );

export interface LockedFieldProps {
  readOnly?: boolean;
  tabIndex?: number;
  'aria-readonly'?: boolean;
  title?: string;
  onMouseDown?: (event: SyntheticEvent) => void;
  onClick?: () => void;
  onFocus?: () => void;
  style?: CSSProperties;
}

/**
 * Spread onto a locked <input>/<textarea>. `disabled` is deliberately not used:
 * it swallows the click, and a locked field must still answer with the notice.
 * Blocking mousedown keeps focus — and therefore the caret — out.
 */
export const lockFieldProps = (
  locked: boolean,
  label: string,
  onNotice: (label: string) => void
): LockedFieldProps =>
  locked
    ? {
        readOnly: true,
        tabIndex: -1,
        'aria-readonly': true,
        title: LOCKED_FIELD_TOAST.replace('{label}', label),
        onMouseDown: (event: SyntheticEvent) => event.preventDefault(),
        onClick: () => onNotice(label),
        onFocus: () => onNotice(label),
        style: { caretColor: 'transparent', userSelect: 'none' } as CSSProperties,
      }
    : {};
