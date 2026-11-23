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

export function consultSurveySrc(surveyId: string) {
  return surveyId === CONSULT_SURVEY_ID ? `/widget/survey/${surveyId}` : `${UPSTREAM}${surveyId}`
}

export function isConsultSurvey(surveyId: string) {
  return surveyId === CONSULT_SURVEY_ID
}

// Hide the survey's own logo and the "personality type" headline. The questions
// stay. Ids come from the LeadConnector markup (`el_<surveyId>_image_0` /
// `_header_1`); the class fallback covers a republish that renumbers the suffix.
export function rewriteSurveyHtml(html: string, surveyId: string, extraHead = '') {
  // The guard goes first in <head>, ahead of every script the quiz loads.
  if (extraHead) {
    html = /<head(\s[^>]*)?>/i.test(html) ? html.replace(/<head(\s[^>]*)?>/i, (m) => m + extraHead) : extraHead + html
  }
  const css = `<style id="nestre-survey-tweaks">
    #el_${surveyId}_image_0,
    #el_${surveyId}_header_1,
    .slide-no-1 .form-builder--image,
    .slide-no-1 .heading-element { display: none !important; }
  </style>`
  // Tell the parent dialog to hide the Chloe intro and pin the iframe as soon
  // as the thank-you "Book Discovery Call" link is clicked, before the iframe
  // navigates to HighLevel's booking app.
  const hook = `<script id="nestre-survey-booking-hook">
(function(){
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t||!t.closest)return;
    if(t.closest('.thank-you-message a')){
      try{window.parent.postMessage({type:'nestre-survey-booking'},window.location.origin)}catch(err){}
    }
  },true);
})();
</script>`
  const inject = css + hook
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
