var referrer;


function initMatomo() {
  /*
  try {
    window._paq = window._paq || [];
    var _paq = window._paq;

    _paq.push(["setDoNotTrack", true]);
    _paq.push(["setTrackerUrl", "/matomo/matomo.php"]);
    _paq.push(["setSiteId", "1"]);

    const script = document.createElement("script");
    script.type='text/javascript';
    script.src= "/matomo/matomo.js";
    script.async=true;
    script.defer=true;

    document.head.appendChild(script);
  } catch(err) {
    console.log("matomo init error: " + err);
  }
  */
}


function trackPageView() {
  /*
  try {
    window._paq = window._paq || [];

    var _paq = window._paq;
    _paq.push(["setCustomUrl", window.location.href]);
    _paq.push(["setDocumentTitle", document.title]);

    if(referrer !== undefined)
      _paq.push(["setReferrerUrl", referrer]);

    _paq.push(["trackPageView"]);

    referrer = window.location.href;
  } catch(err) {
    console.log("matomo track error: " + err);
  }
  */
}


export { initMatomo, trackPageView };
