import { createHmac, timingSafeEqual } from 'node:crypto'

// Bot protection for the discovery-call quiz (Noah, Nov 18). The quiz itself is
// LeadConnector's survey app, re-served from our origin (see survey-widget.ts),
// so we guard the one moment that matters — the final submit — from the inside:
//
//   1. Honeypot. An off-screen text field nobody can see or tab to. People leave it
//      empty; form-filling bots don't.
//   2. Time to submit. The quiz page carries a server-signed "issued at" stamp. A
//      submit that lands sooner than MIN_FILL_MS after the quiz loaded (four
//      questions plus contact details) is a script, not a person.
//   3. Cloudflare Turnstile, when its keys are configured: the quiz dialog renders
//      an invisible-unless-needed widget, and its token is verified here, server
//      side, against Cloudflare's siteverify API.
//
// The quiz's submit request only goes out to LeadConnector after POST
// /api/survey-guard says yes. Turnstile switches on by itself once BOTH
// NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are set (then redeploy:
// the site key is inlined at build time). Until then the honeypot + timing checks
// run alone.

export const MIN_FILL_MS = 4000
const MAX_AGE_MS = 12 * 60 * 60 * 1000

export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
}

function key() {
  // A dedicated secret if one is set; otherwise reuse a server-only secret that
  // already exists in every environment (never shipped to the browser).
  return (
    process.env.SURVEY_GUARD_SECRET ||
    process.env.TURNSTILE_SECRET_KEY ||
    process.env.PAYLOAD_SECRET ||
    process.env.DATABASE_URI ||
    'nestre-survey-guard'
  )
}

function sign(ts: string) {
  return createHmac('sha256', key()).update(`survey:${ts}`).digest('base64url')
}

/** A stamp for "this quiz page was served at <now>", signed so it can't be forged. */
export function issueStamp(now = Date.now()) {
  const ts = String(now)
  return `${ts}.${sign(ts)}`
}

/** ms since the stamp was issued, or null when it is missing, forged or stale. */
export function stampAge(stamp: unknown, now = Date.now()): number | null {
  if (typeof stamp !== 'string') return null
  const [ts, sig] = stamp.split('.')
  if (!ts || !sig || !/^\d{10,16}$/.test(ts)) return null
  const want = Buffer.from(sign(ts))
  const got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null
  const age = now - Number(ts)
  if (age < 0 || age > MAX_AGE_MS) return null
  return age
}

export type GuardVerdict = { ok: true } | { ok: false; reason: 'honeypot' | 'stamp' | 'too_fast' | 'turnstile' }

export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<boolean | 'unavailable'> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (typeof token !== 'string' || !token || token.length > 4096) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return 'unavailable'
    const data = (await r.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return 'unavailable'
  }
}

/**
 * Inline <script> for the quiz document's <head>. It runs before LeadConnector's
 * module bundle, so the bundle's fetch picks up this wrapper. Only the survey
 * submit request is intercepted; everything else passes straight through.
 */
export function guardScript(stamp: string) {
  const js = `(function(){
  var STAMP=${JSON.stringify(stamp)};
  function addHoneypot(){
    if(document.getElementById('nestre-hp'))return;
    var w=document.createElement('div');
    w.setAttribute('aria-hidden','true');
    w.style.cssText='position:absolute!important;left:-10000px!important;top:0!important;width:1px!important;height:1px!important;overflow:hidden!important;';
    w.innerHTML='<label for="nestre-hp">Leave this field empty</label><input type="text" id="nestre-hp" name="nestre_hp_field" tabindex="-1" autocomplete="off" value="">';
    document.body.appendChild(w);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addHoneypot);else addHoneypot();
  var nativeFetch=window.fetch.bind(window);
  function isSubmit(input){
    var u=typeof input==='string'?input:(input&&input.url)?input.url:String(input||'');
    return /\\/surveys\\/submit(\\?|$)/.test(u);
  }
  function getToken(){
    try{
      var p=window.parent;
      if(p&&p!==window&&typeof p.__nestreSurveyTurnstile==='function')return Promise.resolve(p.__nestreSurveyTurnstile()).catch(function(){return null});
    }catch(e){}
    return Promise.resolve(null);
  }
  function blocked(reason){
    try{window.parent.postMessage({type:'nestre-survey-blocked',reason:reason},location.origin)}catch(e){}
    return new Response(JSON.stringify({status:false}),{status:200,headers:{'content-type':'application/json'}});
  }
  window.fetch=function(input,init){
    if(!isSubmit(input))return nativeFetch(input,init);
    var hp=(document.getElementById('nestre-hp')||{}).value||'';
    return getToken().then(function(token){
      return nativeFetch('/api/survey-guard',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({hp:hp,stamp:STAMP,token:token})})
        .then(function(r){
          if(r.ok)return nativeFetch(input,init);
          if(r.status>=500)return nativeFetch(input,init);
          return r.json().catch(function(){return{}}).then(function(d){return blocked(d&&d.reason||'blocked')});
        },function(){return nativeFetch(input,init)});
    });
  };
})();`
  return `<script id="nestre-survey-guard">${js}</script>`
}
