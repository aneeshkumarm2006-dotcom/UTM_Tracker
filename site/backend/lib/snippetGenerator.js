/**
 * Generates the production-ready IIFE <script> tag that users paste into WordPress.
 *
 * Requirements met:
 *  - Saves all 5 UTM params to sessionStorage on every page load if present in URL
 *  - Only attaches click listener on the configured triggerPage (pathname match)
 *  - Reads all configured field IDs from DOM at click time
 *  - Sends POST /api/track with X-API-Key header, UTMs, captured fields, page_url, timestamp
 *  - Wrapped in try-catch — never throws, always silent-fails
 *  - Fires only if utm_source exists in session (skip untracked visitors)
 *  - Minification-safe (no reliance on whitespace, uses var for max compat)
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

  // Build the fields array as a safe JSON string
  const safeFields = JSON.stringify(
    config.fields.map(f => ({
      key: escapeForJS(f.key),
      id: escapeForJS(f.id)
    }))
  );

  return `<script>
/* UTM Conversion Tracker v1.0 — https://trackutm.app */
(function(){
try{
var API_KEY='${safeApiKey}';
var TRACK_URL='${trackUrl}';
var TRIGGER_PAGE='${safeTriggerPage}';
var BUTTON_ID='${safeButtonId}';
var FIELDS=${safeFields};
var UTM_KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
var SS=window.sessionStorage;

/* Step 1: Save UTM params to sessionStorage on every page load */
function saveUTM(){
try{
var p=new URLSearchParams(window.location.search);
for(var i=0;i<UTM_KEYS.length;i++){
var v=p.get(UTM_KEYS[i]);
if(v){SS.setItem(UTM_KEYS[i],v);}
}
}catch(e){}
}

/* Step 2: Normalize pathname for comparison (strip trailing slash, lowercase) */
function normPath(p){
if(!p||p==='/'){return '/';}
return p.replace(/\\/+$/,'').toLowerCase();
}

/* Step 3: On configured trigger page, listen for button click */
function attachListener(){
try{
if(normPath(window.location.pathname)!==normPath(TRIGGER_PAGE)){return;}
var btn=document.getElementById(BUTTON_ID);
if(!btn){return;}
btn.addEventListener('click',function(){
try{
/* Only fire if utm_source exists in session — skip untracked visitors */
/* To track ALL visitors regardless of UTM, remove this guard: */
var utmSource=SS.getItem('utm_source');
if(!utmSource){return;}

var payload={
utm_source:utmSource,
utm_medium:SS.getItem('utm_medium')||'',
utm_campaign:SS.getItem('utm_campaign')||'',
utm_content:SS.getItem('utm_content')||'',
utm_term:SS.getItem('utm_term')||'',
page_url:window.location.href,
timestamp:new Date().toISOString()
};

/* Read configured field values from the DOM at click time */
for(var i=0;i<FIELDS.length;i++){
var el=document.getElementById(FIELDS[i].id);
payload[FIELDS[i].key]=el&&el.value?el.value:'';
}

/* Send tracking data — silent fail, keepalive for page navigation */
fetch(TRACK_URL,{
method:'POST',
headers:{'Content-Type':'application/json','X-API-Key':API_KEY},
body:JSON.stringify(payload),
keepalive:true
}).catch(function(){});
}catch(e){}
});
}catch(e){}
}

saveUTM();
if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',attachListener);
}else{
attachListener();
}
}catch(e){}
})();
</script>`;
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
