import React from 'react'

// Compact nav mark for the Nestre CMS admin. Uses the clean wordmark (small);
// darkened on the light theme so it stays visible.
export default function Icon() {
  return (
    <>
      <style>{`:root[data-theme="light"] img.nestre-admin-icon{filter:brightness(0)}`}</style>
      <img className="nestre-admin-icon" src="/nestre-logo-white.png" alt="Nestre" style={{ height: 15, width: 'auto' }} />
    </>
  )
}
