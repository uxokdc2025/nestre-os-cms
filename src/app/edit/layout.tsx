import React from 'react'

export const metadata = { title: 'Edit · Nestre.OS' }

export default function EditLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
