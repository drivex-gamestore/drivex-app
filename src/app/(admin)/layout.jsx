export const metadata = {
  title: 'Sanity Studio',
  description: 'Admin Content Management System',
}

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
