import { CONSULT_SURVEY_ID } from './get-started'

// LeadConnector serves the quiz as a cross-origin document, so our stylesheet
// cannot reach the logo or the headline inside it. We re-serve that one survey
// from our origin and hide those two blocks; SurveyCtaButton draws Chloe's photo
// and the resized headline in their place.
//
// The document is a Nuxt app that only mounts the quiz on `/widget/survey/:id`.
// Serving it from any other path hydrates an empty shell. form_embed.js also
// hides every iframe whose src contains "/survey" (opacity 0, visibility hidden,
// left -9999px) until that document posts its height, and an empty shell stays
// at the 5px init height — so the questions never appear. The iframe src has to
// be the path the widget actually routes.
const UPSTREAM = 'https://api.leadconnectorhq.com/widget/survey/'

/**
 * Clayton's Microsoft Bookings page (NESTRE, Nov 2026) — where "Schedule a Call"
 * takes someone who just finished the discovery-call quiz.
 *
 * It replaces the link the survey's own `thankyouText` carried
 * (`api.leadconnectorhq.com/booking/…`), which answers 404 and
 * `X-Frame-Options: DENY`, so clicking it painted a blank page inside the quiz
 * iframe. Bookings itself sends a `frame-ancestors` CSP, so this URL can never
 * be opened in an iframe either: the modal's own button lives in the top
 * document (SurveyModal), and the copy inside the proxied survey carries
 * `target="_top"` as the fallback for anyone who opens the widget URL directly.
 */
export const BOOKINGS_URL =
  'https://bookings.cloud.microsoft/bookwithme/user/9d23ac970c0147eaa485abb3aa9fff60@nestreperformance.com?anonymous&ismsaljsauthenabled&ep=bwmEmailSignature'

/** Label on every "Schedule a Call" CTA — the modal's and the proxied copy's. */
export const SCHEDULE_LABEL = 'Schedule a Call'

/** Shape of the `nestre-survey-complete` message the quiz posts to its parent. */
export type SurveyCompletePayload = {
  type: 'nestre-survey-complete'
  /** "Let's explore what's available to you." */
  heading: string
  /** Label in front of the captured interest — "Your interest is". */
  interestLabel: string
  /** The interest the person picked — "Memory". Empty when none was captured. */
  interestValue: string
  /** "Schedule a call with our consultant here:" */
  prompt: string
}

export function consultSurveySrc(surveyId: string) {
  return surveyId === CONSULT_SURVEY_ID ? `/widget/survey/${surveyId}` : `${UPSTREAM}${surveyId}`
}

export function isConsultSurvey(surveyId: string) {
  return surveyId === CONSULT_SURVEY_ID
}

// `thankyouText` is an HTML string inside the survey's Nuxt payload, where `<`
// and `/` arrive as the JSON escapes \u003C and \u002F because the payload
// sits in a <script>. Match the dead booking anchor in that escaped form and in
// plain HTML, so a republish that serializes differently is still covered.
const DEAD_BOOKING_ESCAPED = /\\u003Ca\s[^>]*?leadconnectorhq\.com\\u002Fbooking[^>]*>[^<]*?\\u003C\\u002Fa>/gi
const DEAD_BOOKING_PLAIN = /<a\s[^>]*?leadconnectorhq\.com\/booking[^>]*>[\s\S]*?<\/a>/gi

const SCHEDULE_ANCHOR =
  `<a class="nestre-schedule-cta" href="${BOOKINGS_URL.replace(/&/g, '&amp;')}"` +
  ` target="_top" rel="noopener" title="${SCHEDULE_LABEL}">${SCHEDULE_LABEL}</a>`

// Same anchor in the payload's escaping, so it survives being parsed back out of
// the <script> string it is spliced into.
const SCHEDULE_ANCHOR_ESCAPED = SCHEDULE_ANCHOR
  .replace(/</g, '\\u003C')
  .replace(/\//g, '\\u002F')
  .replace(/"/g, '\\"')

function replaceBookingLink(html: string) {
  return html
    .replace(DEAD_BOOKING_ESCAPED, () => SCHEDULE_ANCHOR_ESCAPED)
    .replace(DEAD_BOOKING_PLAIN, () => SCHEDULE_ANCHOR)
}

// Styling for the survey's own thank-you state (its ThanksMessage component
// renders `.thank-you-message`, padded 48px top and bottom and left-aligned in a
// tall flex column). Only someone opening /widget/survey/:id directly sees this
// — inside our modal the quiz is hidden and SurveyModal draws the native panel —
// so it just has to be centered, compact and on-brand. Every rule overrides an
// inline style, hence `!important`.
const THANKS_CSS = `
    .thank-you-message {
      width: 100% !important;
      flex-grow: 0 !important;
      margin: auto 0 !important;
      max-width: 100% !important;
    }
    .thank-you-message > div {
      display: block !important;
      width: 100% !important;
      max-width: 560px !important;
      margin: 0 auto !important;
    }
    .thank-you-message > div > div:last-child {
      width: 100% !important;
      padding: 20px !important;
      min-height: 0 !important;
    }
    .nestre-schedule-cta {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      margin: 20px auto 0 !important;
      min-height: 56px;
      padding: 16px 36px;
      border: 1px solid transparent;
      border-radius: 999px;
      background: #98d6d3;
      color: #10212a !important;
      font-family: inherit;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
      text-align: center;
      text-decoration: none !important;
      transition: background-color .2s ease, transform .18s ease;
    }
    .nestre-schedule-cta:hover { background: #6bbdb9; transform: translateY(-1px); }
    .nestre-schedule-cta:focus-visible { outline: 2px solid #2b6b66; outline-offset: 3px; }`

// Tells the parent window the quiz reached its thank-you state, and hands over
// the copy LeadConnector rendered there so SurveyModal can redraw it natively.
//
// The signal is the presence of `.thank-you-message` with text in it: the survey
// app mounts that component only once `isFormPosted` flips (or the lead is
// disqualified), i.e. strictly after a submit came back — it does not exist,
// hidden or otherwise, while the questions are on screen. So this cannot
// false-trigger mid-quiz. The posted text is de-duplicated, so a re-render or a
// late `{{custom_value}}` substitution re-posts only when the copy really changed.
const COMPLETE_WATCHER = `<script id="nestre-survey-complete-watcher">(function(){
  var sent='';
  var pending=false;
  function clip(s){ return String(s||'').slice(0,400) }
  function txt(el){ return ((el&&el.textContent)||'').replace(/\\s+/g,' ').trim() }
  function parse(root){
    var out={heading:'',interestLabel:'',interestValue:'',prompt:''};
    var blocks=root.querySelectorAll('h1,h2,h3,h4,p');
    for(var i=0;i<blocks.length;i++){
      var el=blocks[i];
      var t=txt(el);
      if(!t)continue;
      // "Your interest is <strong>Memory</strong>" — the one dynamic line.
      var m=out.interestValue?null:t.match(/^(.*\\binterest\\b.{0,40}?\\bis\\b)\\s*(.*)$/i);
      if(m){
        var strong=el.querySelector('strong,b');
        out.interestLabel=m[1].trim();
        out.interestValue=(strong?txt(strong):m[2]).trim();
        continue;
      }
      // The line that carries the booking link is the prompt. The button text is
      // not part of it, so drop that last run of characters — the link sits at the
      // end of the line, and cutting only the last occurrence leaves a prompt that
      // happens to repeat the label ("Schedule a call … Schedule a Call") intact.
      var a=el.querySelector('a[href]');
      if(a&&!out.prompt){
        var link=txt(a);
        var at=link?t.lastIndexOf(link):-1;
        out.prompt=(at>=0?t.slice(0,at)+' '+t.slice(at+link.length):t).replace(/\\s+/g,' ').trim();
        continue;
      }
      if(!out.heading)out.heading=t;
    }
    if(!out.heading)out.heading=txt(root);
    return out;
  }
  function send(){
    var root=document.querySelector('.thank-you-message');
    if(!root)return;
    var all=txt(root);
    if(!all||all===sent)return;
    sent=all;
    var d=parse(root);
    try{
      if(window.parent&&window.parent!==window){
        window.parent.postMessage({
          type:'nestre-survey-complete',
          heading:clip(d.heading),
          interestLabel:clip(d.interestLabel),
          interestValue:clip(d.interestValue),
          prompt:clip(d.prompt)
        },location.origin);
      }
    }catch(e){}
  }
  function schedule(){
    if(pending)return;
    pending=true;
    setTimeout(function(){pending=false;send()},50);
  }
  function watch(){
    send();
    try{
      new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();</script>`

// Hide the survey's own logo and the "personality type" headline. The questions
// stay. Ids come from the LeadConnector markup (`el_<surveyId>_image_0` /
// `_header_1`); the class fallback covers a republish that renumbers the suffix.
// Also swaps the dead booking link in `thankyouText` for Clayton's Microsoft
// Bookings page and installs the thank-you watcher.
export function rewriteSurveyHtml(html: string, surveyId: string, extraHead = '') {
  // The guard goes first in <head>, ahead of every script the quiz loads.
  if (extraHead) {
    html = /<head(\s[^>]*)?>/i.test(html) ? html.replace(/<head(\s[^>]*)?>/i, (m) => m + extraHead) : extraHead + html
  }
  html = replaceBookingLink(html)
  const css = `<style id="nestre-survey-tweaks">
    #el_${surveyId}_image_0,
    #el_${surveyId}_header_1,
    .slide-no-1 .form-builder--image,
    .slide-no-1 .heading-element { display: none !important; }
${THANKS_CSS}
  </style>`
  const inject = `${css}${COMPLETE_WATCHER}`
  if (html.includes('</head>')) return html.replace('</head>', `${inject}</head>`)
  return inject + html
}

// `extraHead` is injected at the top of the head — the route passes the submit
// guard script there (lib/survey-guard.ts) so it runs before the quiz bundle.
export async function loadConsultSurveyHtml(surveyId: string, extraHead = '') {
  const upstream = await fetch(`${UPSTREAM}${surveyId}`, {
    headers: { accept: 'text/html', 'user-agent': 'NESTRE-survey-widget' },
    cache: 'no-store',
  })
  if (!upstream.ok) throw new Error(`survey ${upstream.status}`)
  const html = await upstream.text()
  return rewriteSurveyHtml(html, surveyId, extraHead)
}
