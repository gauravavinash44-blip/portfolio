/* Google Analytics (GA4). The ID comes from .env (GA_ID) via `npm run lock`.
   Until a real ID is set, nothing loads and no data leaves the page.
   Only page views plus the events in access.js are sent, and those carry the company name only. */
(function () {
  var ID = /*ga*/"G-LV4HW80NXK"/*ga*/;
  if (!/^G-[A-Z0-9]+$/.test(ID) || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", ID);
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);
})();
