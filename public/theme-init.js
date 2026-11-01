// Applies the colour theme before the first paint, so a dark-mode visitor never
// sees a white flash: the choice saved by the masthead switch (localStorage
// "theme": "light" or "dark"), else the system setting. A plain file rather than
// an inline script because the Content Security Policy allows no inline script.
// Kept in step with src/lib/theme.ts.
(function () {
  var pref = null;
  try { pref = localStorage.getItem('theme'); } catch (e) { /* storage blocked: follow the system */ }
  var dark = pref === 'dark' || (pref !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();
