import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { SupabaseAuthProvider } from '@/components/providers/supabase-auth-provider'
import QueryProvider from '@/components/providers/query-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: 'Fruitful Vine Heritage Schools',
        template: '%s | Fruitful Vine Heritage Schools',
    },
    description: 'A faith-based school dedicated to nurturing academic excellence, moral integrity, and godly character. We offer Crèche, Pre-School and Primary education in Badagry, Lagos.',
    keywords: ['school', 'education', 'Badagry', 'Lagos', 'Nigeria', 'nursery', 'primary', 'creche', 'faith-based', 'Fruitful Vine'],
    authors: [{ name: 'Fruitful Vine Heritage Schools' }],
    creator: 'Bold Ideas Innovations Ltd',
    publisher: 'Fruitful Vine Heritage Schools',
    metadataBase: new URL('https://fruitfulvineheritageschools.org.ng'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        locale: 'en_NG',
        url: 'https://fruitfulvineheritageschools.org.ng',
        siteName: 'Fruitful Vine Heritage Schools',
        title: 'Fruitful Vine Heritage Schools - Reaching the Highest Height',
        description: 'A faith-based school offering quality education from Crèche to Primary in Badagry, Lagos. Nurturing academic excellence, moral integrity, and godly character.',
        images: [
            {
                url: '/fruitful_logo_main.png',
                width: 512,
                height: 512,
                alt: 'Fruitful Vine Heritage Schools Logo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fruitful Vine Heritage Schools',
        description: 'Faith-based education from Crèche to Primary in Badagry, Lagos.',
        images: ['/fruitful_logo_main.png'],
    },
    robots: {
        index: true,
        follow: true,
    },
    manifest: '/manifest.json',
    icons: {
        icon: '/fruitful_logo_main.png',
        apple: '/fruitful_logo_main.png',
    },
}

export const viewport: Viewport = {
    themeColor: '#0c4a6e',
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <QueryProvider>
                    <SupabaseAuthProvider>
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </SupabaseAuthProvider>
                </QueryProvider>
            </body>
        </html>
    )
}

