/**
 * Generates the full IIFE <script> string that users paste into their WordPress site.
 *
 * @param {string} apiKey - The user's API key (usr_...)
 * @param {object} config - { triggerPage, buttonId, fields: [{ key, id }] }
 * @param {string} baseUrl - The API base URL (e.g. https://api.trackutm.app)
 * @returns {string} The complete <script>...</script> HTML string
 */
function generateSnippet(apiKey, config, baseUrl) {
  const fieldsJson = JSON.stringify(config.fields);
  const trackUrl = baseUrl.replace(/\/$/, '') + '/api/track';

  return `<script>
(function(){
  var API_KEY='${apiKey}';
  var TRACK_URL='${trackUrl}';
  var CONFIG={
    triggerPage:'${config.triggerPage}',
    buttonId:'${config.buttonId}',
    fields:${fieldsJson}
  };

  /* Save UTM params to sessionStorage on every page load */
  function saveUTM(){
    try{
      var params=new URLSearchParams(window.location.search);
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){
        var v=params.get(k);
        if(v) sessionStorage.setItem(k,v);
      });
    }catch(e){}
  }

  saveUTM();

  /* Attach click listener only on the configured trigger page */
  document.addEventListener('DOMContentLoaded',function(){
    try{
      if(window.location.pathname!==CONFIG.triggerPage) return;

      var btn=document.getElementById(CONFIG.buttonId);
      if(!btn) return;

      btn.addEventListener('click',function(){
        try{
          var utmSource=sessionStorage.getItem('utm_source');
          /* Skip untracked visitors (no utm_source in session) */
          if(!utmSource) return;

          var payload={
            utm_source:utmSource||'',
            utm_medium:sessionStorage.getItem('utm_medium')||'',
            utm_campaign:sessionStorage.getItem('utm_campaign')||'',
            utm_content:sessionStorage.getItem('utm_content')||'',
            utm_term:sessionStorage.getItem('utm_term')||'',
            page_url:window.location.href,
            timestamp:new Date().toISOString()
          };

          /* Read all configured field IDs from DOM at click time */
          CONFIG.fields.forEach(function(f){
            var el=document.getElementById(f.id);
            payload[f.key]=el?el.value||'':'';
          });

          /* Silent POST — never throw, always fail silently */
          fetch(TRACK_URL,{
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              'X-API-Key':API_KEY
            },
            body:JSON.stringify(payload)
          }).catch(function(){});
        }catch(e){}
      });
    }catch(e){}
  });
})();
</script>`;
}

module.exports = generateSnippet;
