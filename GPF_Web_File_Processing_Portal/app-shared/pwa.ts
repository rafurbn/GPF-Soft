/**
 * Registers the app-shell service worker. Every entry point (root dashboard and
 * the four sub-apps) calls this once, which is what makes the portal installable
 * as a PWA from the browser address bar or the header Install button.
 */
export const registerPwa = (): void => {
  if (!('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // A failed registration only costs offline shell caching, never the portal itself.
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
};
