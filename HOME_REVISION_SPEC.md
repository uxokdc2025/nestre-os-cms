# NESTRE home revision — spec (2026-09-11)

Source of truth for the "steal from original" items: **https://site-zeta-henna-64.vercel.app/**
Target: `nestre/cms` (Payload + Next 16), live https://nestre-os-cms.vercel.app/

## GLOBAL (apply to every page)
- **G1 · Grid width** — the original home's content grid is wider. Measure its max-width and apply site-wide (replace the current `.wrap` max-width of 1200px). Every page/section uses this grid width.
- **G2 · Video autoplay on scroll** — any `<video>` autoplays (muted, loop, playsInline) once it's ~halfway into the viewport (IntersectionObserver). Remove the play-button-on-hover; on hover show only a subtle pause outline.
- **G3 · Transitional last-CTA per page** — each page's final CTA is a headline that pushes to the NEXT page:
  Home → How It Works · Neuro Labs → The App · The App → Our Story · Our Story → For Teams · For Teams → "Let's get started / Book now".

## HERO
- **H1** · First CTA: remove "See How It Works". Primary CTA = **"Learn more"** → smooth-scrolls down to section 2 (subtle).
- **H2** · Hero is **60px taller**.

## SECTION 2 — "Performance, from the neck up" (statScorecard)
- **S2-1** · Replace the blue stat card on the right with the **original animated card/animation** from site-zeta-henna-64.

## LOGO BANNER (under section 2)
- **L1** · Responsive banner; logos **bigger**; strip spans the **full grid width** (NESTRE logo → Book a Consultation button = the header width).

## STEPS — "Understand · Train · Evolve" (01/02/03)
- **ST-1** · Rebuild using the **original** homepage design (grab from site-zeta-henna-64).
- **ST-2** · Swap the **02 Train** image with the **03 Review** image.

## "Your first NESTRE visit"
- **V1** · Rebuild from the **original** (robust build + carousel). Steal it.

## "Find your NESTRE Neuro Lab" (locations)
- **N1** · From the original. **3 locations.** ⛔ BLOCKED: David provides location content + a picture. Design the location experiences once content arrives.

## "The NESTRE app"
- **A1** · Steal the **original** layout.
- **A2** · Fix shadows/images **cut off at the top** — remove the overflow-clipping div/frame so nothing is clipped.
- **A3** · **Scrollytelling**: ≥4 images; as the user scrolls, elegantly swipe through all 4. Keep bottom carousel arrows if they return. ⛔ PARTIAL: start with IMG_0235, IMG_0244, app-bloom-loop, app-water-loop; David sends more.
- **A4** · "Explore the NESTRE app" button → the app section (/the-app).

## PODCAST
- **P1** · "Explore the podcast" → https://www.youtube.com/@BetterMindPodcast

## CLOSING — "Ready for more" (guy + girl image)
- **C1** · The final image frame **grows to full-screen**; in parallax the copy ("Ready for more"…) reveals from the bottom; a **vignette darkens** the area as it rises; it then continues to reveal the **footer**.
- **C2** · Rewrite the last-CTA language to push the user into **How It Works** (per G3).

## FOOTER
- **F1** · Add **Spotify** logo (→ podcast) + **Apple Podcasts** logo. Source official brand marks; David sends if not found.

## DONE (already shipped this session)
- New hero web video · element/card stagger animations · stat-bar fill · carousel arrows on rails.

---
# HOW IT WORKS page (brief 2026-09-11) — reimagine with dynamic layouts

## GLOBAL patterns confirmed here (apply to EVERY landing page)
- **GH · Hero transition** — every page hero is taller (hides some bottom); primary CTA is a "learn more / discover" that on click **smooth-pushes down** to the next section, which then plays the **staged intro animations** (microtext → h1 → body → cards), fluid. This is the standard landing-page opener.
- **GL · Staggering card layouts** — alternate section rhythm: copy-left/image-right → reverse image-left/copy-right → center focal piece. Vary per section, no two the same in a row.
- **GS · Scrollytelling** — sections where cards float out / stack in as you scroll (parallax), card1→card2→card3, then transition.
- **GF · FAQ pattern (global)** — progressive reveal (part 1 up, scroll → 2, 3, 4); **question text ~2pt bigger** so it stands out. Reused on other pages.
- **GC · Closing frame (global)** — final image **grows to full frame**; parallax **mask reveals** the copy; darkening vignette; then reveals footer; **transitional CTA to the NEXT page**.

## HOW IT WORKS specifics
- **HIW-1** · First CTA "Explore the experience" → recommend better copy (rec: **"Walk me through it ↓"**). Apply GH.
- **HIW-2** · Reimagine whole page with GL alternating layouts.
- **HIW-3** · "Your NESTRE Mindset Profile" — 4 stat cards redesigned NESTRE-style; **cards start center and expand/float out on scroll**; centerpiece dark block = "the person behind the data" + blurb; central focal copy, cards float & drift as you scroll.
- **HIW-4** · "What makes sense" — image left; scroll floats card1→2→3 (GS); card3 → transition to next.
- **HIW-5** · "Your body can be still — the work is happening from the neck up" — dark, near-full-screen, high interaction; use icons/lifestyle imagery, promote strongly.
- **HIW-6** · "More possibilities" — David supplies mobile screens → build an **iPhone device mockup** (first time); layout copy one side / device other; dynamic + micro-interactions. ⛔ needs David's mobile screens.
- **HIW-7** · "Before you begin" FAQ — apply GF (progressive reveal, bigger questions); add a couple more questions.
- **HIW-8** · Closing (GC) — full-frame grow + parallax mask reveal "You deserve to experience the world…"; CTA → **Neuro Labs** ("Plan your visit / Go experience it for yourself").

## GLOBAL rule — app screens
- **GA · iPhone frame** — any app screen (IMG_0235/0244, App_Visuals, the 4 stat cards Sleep/Recovery/Steps/Performance) is shown FULL inside a realistic iOS iPhone device frame (rounded corners, dynamic island). Build a reusable Phone component.

## LOCATIONS content (from Figma node 4-140) — free creative liberty, don't overdo it
Services (all): Cognitive Baseline · NeuroStrength Training · Performance Review. Email: info@nestreperformance.com
- **Lake Nona** — Orlando, FL · Inside Lake Nona Performance Club · 6775 Chopra Ter, Orlando, FL 32827 · Mon–Fri 9:00–6:00, Sat closed · (689) 710-3260 · "Located inside Lake Nona Performance Club, NESTRE brings cognitive performance into the same environment where people already train, recover, and pursue more from themselves."
- **Winter Park** — Orlando, FL · 2200 Lee Rd, Winter Park, FL 32789 · Mon–Thu 9:00–5:00, Fri 8:00–12:00, Sat–Sun closed · (321) 285-2369 · "Every NESTRE Neuro Lab delivers the same guided experience. A trained NeuroTrainer leads assessment, interpretation, and NeuroStrength Training in a calm, private setting."
- **Monterey** — Monterey, CA · Inside Terrapin Physical Therapy · 5 Harris Ct, Bldg. T, Suite 102, Monterey, CA 93940 · Mon–Fri 8:00–5:00, Sat–Sun closed · (831) 372-3579 · (same guided-experience blurb)

---
# NEWS + EVENTS redesign (brief 2026-09-11)
- **Source grabbed:** all **21 articles** from nestreperformance.com via WP REST API (title, date, link, image, excerpt) → `news-archive.json`. Images will be re-hosted on Supabase (old WP site closes after launch).
- **NEW-1** · Card-style layout (not the current list).
- **NEW-2** · **Co-mingle News + Events** — an event is also news (e.g., "NESTRE hosting a talk at <place>, <date>, <time>"). One feed.
- **NEW-3** · **Tabs / filter**: All · News · Events (pick the cleanest — tabs recommended).
- **NEW-4** · News collection gains: `type` (news|event), and event fields (venue/location, startsAt date+time). ⛔ David sends a couple of EVENT examples to seed + confirm fields.
- **NEW-5** · Each card: image, type badge (News/Event), date (or event date/time + place), title, excerpt, "Read more" → external link (news) or event detail.

## NEWS + EVENTS — design locked (inspiration: Blabber; match OUR system)
- Card GRID, NESTRE design system (not the red theme). Card = image, **category/type badge**, title, "by · date", excerpt, "Read more" (arrow, our style).
- **NO comments, NO sidebar, no view counts** — clean.
- **Events treated differently**: badge = EVENT; **float the date, time, and location prominently** on the card.
- **One vertical feed + lazy load** (load-more on scroll), All · News · Events tabs above.
