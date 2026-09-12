import React from 'react'

// Login-screen brand mark for the Nestre CMS admin (replaces the Payload logo).
// The source art is white; on the light admin theme we darken it so it stays visible.
export default function Logo() {
  return (
    <>
      <style>{`:root[data-theme="light"] img.nestre-admin-logo{filter:brightness(0)}`}</style>
      <img
        className="nestre-admin-logo"
        src="/nestre-logo-white.png"
        alt="Nestre CMS"
        style={{ width: 200, maxWidth: '60vw', height: 'auto' }}
      />
    </>
  )
}
