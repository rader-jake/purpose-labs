export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0D1B3E' }}>
        {children}
      </body>
    </html>
  )
}
