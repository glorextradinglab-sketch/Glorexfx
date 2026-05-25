import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CanvasCursor from '@/components/ui/canvas-cursor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spline Demo',
  description: 'Spline 3D + UI Components',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CanvasCursor />
        {children}
      </body>
    </html>
  )
}
