import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from "@/components/providers/language-provider";
import Providers from "@/components/providers/session-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import GoogleAnalytics from "@/components/google-analytics";

const inter = Inter({ subsets: ['latin'] })

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dr Sitna Mwanzi Oncology Clinic - Cancer Care in Nairobi",
  description: "Book appointments with Dr. Sitna Mwanzi for comprehensive cancer screening, diagnosis, treatment and supportive care in Nairobi, Kenya.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Dr Sitna Mwanzi Oncology Clinic - Expert Oncology Care",
    description: "Comprehensive and compassionate cancer screening, diagnosis, treatment and supportive care in Nairobi",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <LanguageProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  )
}