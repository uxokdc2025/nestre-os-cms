// Convert our simple {t,x} doc blocks into Payload Lexical rich-text JSON, so the
// legal/support content can be seeded into the CMS and then edited in the Studio.

type Block = { t: 'h2' | 'h3' | 'p' | 'li'; x: string }

const text = (s: string) => ({
  type: 'text',
  text: s,
  detail: 0,
  format: 0,
  mode: 'normal' as const,
  style: '',
  version: 1,
})
const para = (s: string) => ({
  type: 'paragraph',
  children: [text(s)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})
const heading = (tag: 'h2' | 'h3', s: string) => ({
  type: 'heading',
  tag,
  children: [text(s)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})
const listitem = (s: string, i: number) => ({
  type: 'listitem',
  value: i + 1,
  children: [text(s)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})
const bulletList = (items: string[]) => ({
  type: 'list',
  listType: 'bullet' as const,
  tag: 'ul' as const,
  start: 1,
  children: items.map((s, i) => listitem(s, i)),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

export function docToLexical(blocks: Block[]) {
  const children: unknown[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length) {
      children.push(bulletList(list))
      list = []
    }
  }
  for (const b of blocks) {
    if (b.t === 'li') {
      list.push(b.x)
      continue
    }
    flush()
    if (b.t === 'h2') children.push(heading('h2', b.x))
    else if (b.t === 'h3') children.push(heading('h3', b.x))
    else children.push(para(b.x))
  }
  flush()
  return { root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 } }
}
