import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants"

import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"

import ClientLayout from "./client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s – ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
