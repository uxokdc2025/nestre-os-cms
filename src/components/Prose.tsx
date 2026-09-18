import React from 'react'

// Minimal, dependency-free renderer for Payload's Lexical rich-text value.
// Handles the node types our legal/support docs use: headings, paragraphs,
// bullet lists, and inline text with basic marks + links. Anything unknown is
// skipped safely. This lets those pages be fully CMS-editable without pulling in
// the heavy Lexical React package.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Node = any

function renderText(n: Node, key: number): React.ReactNode {
  let el: React.ReactNode = n.text ?? ''
  const fmt = typeof n.format === 'number' ? n.format : 0
  if (fmt & 1) el = <strong key={`b${key}`}>{el}</strong> // bold
  if (fmt & 2) el = <em key={`i${key}`}>{el}</em> // italic
  if (fmt & 8) el = <u key={`u${key}`}>{el}</u> // underline
  return <React.Fragment key={key}>{el}</React.Fragment>
}

function renderChildren(children: Node[] | undefined): React.ReactNode[] {
  return (children || []).map((c, i) => renderNode(c, i)).filter(Boolean)
}

function renderInline(children: Node[] | undefined): React.ReactNode[] {
  return (children || []).map((c, i) => {
    if (c.type === 'text') return renderText(c, i)
    if (c.type === 'link') {
      const url = c.fields?.url || c.url || '#'
      const ext = /^https?:/i.test(url)
      return (
        <a key={i} href={url} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {renderInline(c.children)}
        </a>
      )
    }
    return renderText(c, i)
  })
}

function renderNode(n: Node, key: number): React.ReactNode {
  switch (n.type) {
    case 'heading': {
      const tag = (n.tag || 'h2') as 'h2' | 'h3' | 'h4'
      const H = tag
      return <H key={key}>{renderInline(n.children)}</H>
    }
    case 'paragraph': {
      const kids = renderInline(n.children)
      if (!kids.length || (kids.length === 1 && kids[0] === '')) return null
      return <p key={key}>{kids}</p>
    }
    case 'list': {
      const ordered = n.listType === 'number'
      const L = ordered ? 'ol' : 'ul'
      return <L key={key}>{renderChildren(n.children)}</L>
    }
    case 'listitem':
      return <li key={key}>{renderInline(n.children)}</li>
    case 'quote':
      return <blockquote key={key}>{renderInline(n.children)}</blockquote>
    case 'linebreak':
      return <br key={key} />
    default:
      // container-ish nodes: render their children
      if (Array.isArray(n.children)) return <React.Fragment key={key}>{renderChildren(n.children)}</React.Fragment>
      return null
  }
}

export function Prose({ value }: { value: any }) {
  const root = value?.root
  if (!root?.children?.length) return null
  return <>{renderChildren(root.children)}</>
}

export default Prose
