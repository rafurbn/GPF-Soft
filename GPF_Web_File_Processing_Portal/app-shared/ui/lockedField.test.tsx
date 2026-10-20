import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { SyntheticEvent } from 'react';
import { lockFieldProps, useLockedFieldNotice } from './lockedField';
import { LOCKED_FIELD_TOAST } from './tokens';

const fakeEvent = () => ({ preventDefault: vi.fn() }) as unknown as SyntheticEvent;

describe('lockFieldProps', () => {
  it('gives an unlocked field nothing, so it stays editable', () => {
    expect(lockFieldProps(false, 'সন', () => {})).toEqual({});
  });

  it('keeps a locked field clickable — no disabled, no pointer-events', () => {
    const props = lockFieldProps(true, 'সন', () => {});
    expect(props.readOnly).toBe(true);
    expect(props.tabIndex).toBe(-1);
    expect((props as Record<string, unknown>).disabled).toBeUndefined();
    expect(props.style?.caretColor).toBe('transparent');
    expect(props.style?.userSelect).toBe('none');
    expect((props.style as Record<string, unknown> | undefined)?.pointerEvents).toBeUndefined();
  });

  it('shows the notice on click and blocks focus so no caret can appear', () => {
    const onNotice = vi.fn();
    const props = lockFieldProps(true, 'প্রাপক', onNotice);
    props.onClick?.();
    props.onFocus?.();
    expect(onNotice).toHaveBeenNthCalledWith(1, 'প্রাপক');
    expect(onNotice).toHaveBeenNthCalledWith(2, 'প্রাপক');

    const event = fakeEvent();
    props.onMouseDown?.(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('uses the shared locked-field wording in the tooltip too', () => {
    const props = lockFieldProps(true, 'জেলার নাম', () => {});
    expect(props.title).toBe(LOCKED_FIELD_TOAST.replace('{label}', 'জেলার নাম'));
  });
});

describe('useLockedFieldNotice', () => {
  it('raises the red round toast, not the amber triangle', () => {
    const showToast = vi.fn();
    const Probe = () => {
      useLockedFieldNotice(showToast)('সন');
      return null;
    };
    renderToStaticMarkup(<Probe />);
    expect(showToast).toHaveBeenCalledWith(
      LOCKED_FIELD_TOAST.replace('{label}', 'সন'),
      'error'
    );
  });
});
