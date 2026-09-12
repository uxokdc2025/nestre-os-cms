/* Turns the Brand global into a <style> block + optional Google-Fonts href, so
   editing Brand in the Studio restyles the whole live site (tokens cascade). */
/* eslint-disable @typescript-eslint/no-explicit-any */

const HEX = /^#?[0-9a-fA-F]{3,8}$/
const safeColor = (v: string) => (HEX.test(v.trim()) ? (v.trim().startsWith('#') ? v.trim() : `#${v.trim()}`) : null)
const gf = (name: string) => name.trim().replace(/\s+/g, '+')

export function brandCss(brand: any): { css: string; fontHref: string | null } {
  if (!brand) return { css: '', fontHref: null }
  const vars: string[] = []
  for (const c of brand.colors || []) {
    const val = c?.value && safeColor(String(c.value))
    const tok = c?.token && String(c.token).trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (val && tok) vars.push(`--${tok}: ${val};`)
  }

  const heading = brand.headingFont ? String(brand.headingFont).trim() : ''
  const body = brand.bodyFont ? String(brand.bodyFont).trim() : ''
  if (heading) vars.push(`--font-heading: '${heading}', var(--font-instrument), system-ui, sans-serif;`)
  if (body) vars.push(`--font-body: '${body}', var(--font-instrument), system-ui, sans-serif;`)

  const rules: string[] = []
  if (vars.length) rules.push(`:root{${vars.join('')}}`)

  // radius is a BUTTON/pill token only — never cards (999px would turn cards into circles)
  const radius = brand.radius && /^[0-9.]+(px|rem|em|%)$/.test(String(brand.radius).trim()) ? String(brand.radius).trim() : ''
  if (radius) rules.push(`.btn,.nav-cta,.mobile-cta,.btn.aqua{border-radius:${radius}}`)
  if (body) rules.push(`body{font-family:var(--font-body)}`)
  if (heading) rules.push(`h1,h2,h3,.h1,.h2,.hero h1{font-family:var(--font-heading)}`)

  const fams = [heading, body].filter(Boolean).map((f) => `family=${gf(f)}:wght@400;500;600;700`)
  const fontHref = fams.length ? `https://fonts.googleapis.com/css2?${fams.join('&')}&display=swap` : null

  return { css: rules.join(''), fontHref }
}
