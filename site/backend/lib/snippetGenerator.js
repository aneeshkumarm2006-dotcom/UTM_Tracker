/**
 * Generates the production-ready <script> tag that users paste into their website.
 *
 * Pattern:
 *  - On ANY page load: if UTM params exist in URL, save them as session cookies
 *  - Pings /api/health on the trigger page to wake the server before form submit
 *  - Only attaches click listener on the configured triggerPage (pathname match)
 *  - On button click: reads configured field IDs from DOM + UTM cookies
 *  - POSTs conversion data to the platform's /api/track endpoint
 *  - Wrapped in DOMContentLoaded — never throws, always silent-fails
 *  - Fires only if utm_source exists in cookies (skip untracked visitors)
 *
 * @param {string} apiKey - The user's API key (usr_...)
 * @param {object} config - { triggerPage, buttonId, fields: [{ key, id }] }
 * @param {string} baseUrl - The API base URL (e.g. https://api.trackutm.app)
 * @returns {string} The complete <script>...</script> HTML string
 */
function generateSnippet(apiKey, config, baseUrl) {
  // Sanitize values to prevent XSS via config injection
  const safeApiKey = escapeForJS(apiKey);
  const safeTriggerPage = escapeForJS(config.triggerPage);
  const safeButtonId = escapeForJS(config.buttonId);
  const trackUrl = escapeForJS(baseUrl.replace(/\/$/, '') + '/api/track');
  const healthUrl = escapeForJS(baseUrl.replace(/\/$/, '') + '/api/health');

  // Build the fields array as a safe JSON string
  const safeFields = JSON.stringify(
    config.fields.map(f => ({
      key: escapeForJS(f.key),
      id: escapeForJS(f.id)
    }))
  );

  return `/* UTM Conversion Tracker v3.1 — https://trackutm.app */
document.addEventListener('DOMContentLoaded', function () {
  var API_KEY = '${safeApiKey}';
  var TRACK_URL = '${trackUrl}';
  var HEALTH_URL = '${healthUrl}';
  var TRIGGER_PAGE = '${safeTriggerPage}';
  var BUTTON_ID = '${safeButtonId}';
  var FIELDS = ${safeFields};
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  /* ── Cookie helpers ── */
  function setCookie(name, value) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=2592000; SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  /* STEP 1: On ANY page, if UTM params exist in URL, save them as cookies (30 days) */
  function saveUTMParameters() {
    try {
      var urlParams = new URLSearchParams(window.location.search);
      var source = urlParams.get('utm_source');
      if (source) {
        for (var i = 0; i < UTM_KEYS.length; i++) {
          var val = urlParams.get(UTM_KEYS[i]);
          if (val) setCookie(UTM_KEYS[i], val);
        }
      }
    } catch (e) {}
  }

  /* STEP 2: Read UTM params from cookies */
  function getUTMParameters() {
    var params = {};
    for (var i = 0; i < UTM_KEYS.length; i++) {
      params[UTM_KEYS[i]] = getCookie(UTM_KEYS[i]);
    }
    return params;
  }

  /* STEP 3: Read configured form field values from DOM */
  function getFormData() {
    var data = {};
    for (var i = 0; i < FIELDS.length; i++) {
      var el = document.getElementById(FIELDS[i].id);
      data[FIELDS[i].key] = el ? el.value.trim() : '';
    }
    return data;
  }

  /* STEP 4: Send conversion data to platform API */
  function sendConversionData(utmParams) {
    var formData = getFormData();

    var payload = {
      utm_source: utmParams.utm_source || '',
      utm_medium: utmParams.utm_medium || '',
      utm_campaign: utmParams.utm_campaign || '',
      utm_content: utmParams.utm_content || '',
      utm_term: utmParams.utm_term || '',
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    };

    /* Add all captured form fields */
    var fieldKeys = Object.keys(formData);
    for (var i = 0; i < fieldKeys.length; i++) {
      payload[fieldKeys[i]] = formData[fieldKeys[i]];
    }

    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(payload),
      keepalive: true
    })
      .then(function () { console.log('\\u2705 Conversion tracked'); })
      .catch(function () { console.log('\\u26a0\\ufe0f Tracking failed'); });
  }

  /* STEP 5: Always save UTMs on every page load */
  saveUTMParameters();

  /* STEP 6: On the trigger page — wake server early + attach submit listener */
  if (window.location.pathname.includes(TRIGGER_PAGE)) {

    /* Wake up Render free-tier server so it is ready when user clicks submit */
    try {
      fetch(HEALTH_URL, { method: 'GET' }).catch(function () {});
    } catch (e) {}

    var utmParams = getUTMParameters();
    if (utmParams.utm_source) {
      var submitButton = document.getElementById(BUTTON_ID);
      if (submitButton) {
        submitButton.addEventListener('click', function () {
          sendConversionData(utmParams);
        });
      }
    }
  }
});`;
}

/**
 * Escapes a string for safe embedding in a JS single-quoted string literal.
 * Prevents XSS via malicious config values.
 */
function escapeForJS(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')   // backslashes first
    .replace(/'/g, "\\'")     // single quotes
    .replace(/"/g, '\\"')     // double quotes
    .replace(/</g, '\\x3c')   // prevent </script> injection
    .replace(/>/g, '\\x3e')   // prevent tag injection
    .replace(/\n/g, '\\n')    // newlines
    .replace(/\r/g, '\\r');   // carriage returns
}

module.exports = generateSnippet;