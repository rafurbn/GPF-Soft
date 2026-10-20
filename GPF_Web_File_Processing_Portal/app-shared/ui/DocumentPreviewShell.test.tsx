import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DocumentPreviewShell } from './DocumentPreviewShell';

const shell = (props: { isOpen?: boolean; overlayClassName?: string } = {}) =>
  renderToStaticMarkup(
    <DocumentPreviewShell
      isOpen
      onClose={() => {}}
      onPrint={() => {}}
      title="টিতল"
      subtitle={<span>সাবটাইটল</span>}
      {...props}
    >
      <div id="printable-document">দলিল</div>
    </DocumentPreviewShell>
  );

describe('shared preview modal chrome', () => {
  it('renders nothing while closed', () => {
    expect(shell({ isOpen: false })).toBe('');
  });

  it('gives every app the same title, print button and close pair', () => {
    const html = shell();
    expect(html).toContain('টিতল');
    expect(html).toContain('সাবটাইটল');
    expect(html.match(/<button/g)).toHaveLength(3);
    expect(html).toContain('printable-document');
  });

  it('hides the overlay, header and footer, but never the document, from the printed page', () => {
    const html = shell();
    expect(html.match(/no-print/g)).toHaveLength(3);
    const documentIndex = html.indexOf('printable-document');
    const footerIndex = html.lastIndexOf('no-print');
    expect(documentIndex).toBeGreaterThan(html.indexOf('no-print'));
    expect(documentIndex).toBeLessThan(footerIndex);
  });

  it('lets an app that prints in-page keep its overlay printable', () => {
    const html = shell({ overlayClassName: 'fixed inset-0 z-50 bg-black/80' });
    expect(html.match(/no-print/g)).toHaveLength(2);
    expect(html.startsWith('<div class="fixed inset-0 z-50 bg-black/80"')).toBe(true);
  });
});
