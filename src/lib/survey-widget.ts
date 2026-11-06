import { CONSULT_SURVEY_ID } from './get-started'

// LeadConnector serves the quiz as a cross-origin document, so our stylesheet
// cannot reach the logo or the headline inside it. We re-serve that one survey
// from our origin and hide those two blocks; SurveyCtaButton draws Chloe's photo
// and the resized headline in their place.
const UPSTREAM = 'https://api.leadconnectorhq.com/widget/survey/'

export function consultSurveySrc(surveyId: string) {
  return surveyId === CONSULT_SURVEY_ID ? `/api/survey-widget/${surveyId}` : `${UPSTREAM}${surveyId}`
}

export function isConsultSurvey(surveyId: string) {
  return surveyId === CONSULT_SURVEY_ID
}

// Hide the survey's own logo and the "personality type" headline. The questions
// stay. Ids come from the LeadConnector markup (`el_<surveyId>_image_0` /
// `_header_1`); the class fallback covers a republish that renumbers the suffix.
export function rewriteSurveyHtml(html: string, surveyId: string) {
  const css = `<style id="nestre-survey-tweaks">
    #el_${surveyId}_image_0,
    #el_${surveyId}_header_1,
    .slide-no-1 .form-builder--image,
    .slide-no-1 .heading-element { display: none !important; }
  </style>`
  if (html.includes('</head>')) return html.replace('</head>', `${css}</head>`)
  return css + html
}

export async function loadConsultSurveyHtml(surveyId: string) {
  const upstream = await fetch(`${UPSTREAM}${surveyId}`, {
    headers: { accept: 'text/html', 'user-agent': 'NESTRE-survey-widget' },
    cache: 'no-store',
  })
  if (!upstream.ok) throw new Error(`survey ${upstream.status}`)
  const html = await upstream.text()
  return rewriteSurveyHtml(html, surveyId)
}
