/**
 * Registers the service worker. Every entry point (root dashboard and the four
 * sub-apps) calls this once. The worker caches nothing — it only makes the site
 * installable, so the home-screen icon is a plain shortcut to the website and
 * the portal stays online-only.
 */
export const registerPwa = (): void => {
  if (!('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // A failed registration only costs the install icon, never the portal itself.
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
};
