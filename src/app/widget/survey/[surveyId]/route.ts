import { NextResponse } from 'next/server'
import { CONSULT_SURVEY_ID } from '@/lib/get-started'
import { loadConsultSurveyHtml } from '@/lib/survey-widget'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Same-origin copy of the consultation quiz so the popup can hide the survey's
// own logo and headline. The path has to be `/widget/survey/:id` — that is the
// route the LeadConnector app mounts. Only the known survey id is fetched.
export async function GET(_req: Request, ctx: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await ctx.params
  if (surveyId !== CONSULT_SURVEY_ID) {
    return NextResponse.json({ error: 'unknown_survey' }, { status: 404 })
  }
  try {
    const html = await loadConsultSurveyHtml(surveyId)
    return new NextResponse(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, max-age=60',
        // Framed by our own quiz dialog only.
        'x-frame-options': 'SAMEORIGIN',
      },
    })
  } catch {
    return NextResponse.json({ error: 'survey_unavailable' }, { status: 502 })
  }
}
