/* Lightweight page-layout history for the Studio (undo). Uses Payload's pg pool
   directly against cms.page_history — Payload doesn't manage this table. */
/* eslint-disable @typescript-eslint/no-explicit-any */

function pool(payload: any) {
  return payload?.db?.pool as { query: (t: string, p?: any[]) => Promise<{ rows: any[] }> } | undefined
}

/** Save the current layout as a restore point (best-effort; never throws into the caller). */
export async function snapshot(payload: any, slug: string, layout: unknown, label = 'edit') {
  try {
    const p = pool(payload); if (!p) return
    await p.query('insert into cms.page_history (slug, layout, label) values ($1, $2, $3)', [slug, JSON.stringify(layout ?? []), label])
    // keep only the most recent 30 per page
    await p.query(
      `delete from cms.page_history where slug = $1 and id not in (select id from cms.page_history where slug = $1 order by created_at desc limit 30)`,
      [slug],
    )
  } catch { /* history is best-effort */ }
}

/** Count restore points for a page. */
export async function historyCount(payload: any, slug: string): Promise<number> {
  try {
    const p = pool(payload); if (!p) return 0
    const { rows } = await p.query('select count(*)::int as n from cms.page_history where slug = $1', [slug])
    return rows[0]?.n ?? 0
  } catch { return 0 }
}

/** Pop the latest restore point (returns its layout and removes it). */
export async function popLatest(payload: any, slug: string): Promise<unknown | null> {
  const p = pool(payload); if (!p) return null
  const { rows } = await p.query('select id, layout from cms.page_history where slug = $1 order by created_at desc limit 1', [slug])
  if (!rows.length) return null
  await p.query('delete from cms.page_history where id = $1', [rows[0].id])
  return rows[0].layout
}
