import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { SupabaseAuthProvider } from '@/components/providers/supabase-auth-provider'
import QueryProvider from '@/components/providers/query-provider'
import { PWAProvider } from '@/components/providers/pwa-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: 'Fruitful Vine Heritage Schools | Quality Education in Badagry, Lagos',
        template: '%s | Fruitful Vine Heritage Schools',
    },
    description: 'A faith-based school dedicated to nurturing academic excellence, moral integrity, and godly character. We offer Crèche, Pre-School and Primary education in Badagry, Lagos, Nigeria. Enroll your child today!',
    keywords: [
        'school', 'education', 'Badagry', 'Lagos', 'Nigeria', 'nursery', 'primary', 
        'creche', 'faith-based', 'Fruitful Vine', 'private school', 'quality education',
        'christian school', 'pre-school', 'kindergarten', 'best school in Badagry',
        'Fruitful Vine Heritage Schools', 'FVHS', 'academic excellence'
    ],
    authors: [{ name: 'Fruitful Vine Heritage Schools' }],
    creator: 'Bold Ideas Innovations Ltd',
    publisher: 'Fruitful Vine Heritage Schools',
    metadataBase: new URL('https://fruitfulvineheritageschools.org.ng'),
    alternates: {
        canonical: '/',
    },
    category: 'Education',
    classification: 'Primary and Pre-School Education',
    openGraph: {
        type: 'website',
        locale: 'en_NG',
        url: 'https://fruitfulvineheritageschools.org.ng',
        siteName: 'Fruitful Vine Heritage Schools',
        title: 'Fruitful Vine Heritage Schools - Reaching the Highest Height',
        description: 'A faith-based school offering quality education from Crèche to Primary in Badagry, Lagos. Nurturing academic excellence, moral integrity, and godly character. Enroll your child today!',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 630,
                alt: 'Fruitful Vine Heritage Schools - Quality Faith-Based Education in Badagry, Lagos',
                type: 'image/png',
            },
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
        site: '@fruitfulvineschools',
        creator: '@fruitfulvineschools',
        title: 'Fruitful Vine Heritage Schools - Quality Education in Badagry',
        description: 'Faith-based education from Crèche to Primary in Badagry, Lagos. Nurturing academic excellence and godly character.',
        images: {
            url: '/twitter-image',
            alt: 'Fruitful Vine Heritage Schools',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        // Add these when you have them
        // google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
    },
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/fruitful_logo_main.png', sizes: '32x32', type: 'image/png' },
            { url: '/fruitful_logo_main.png', sizes: '16x16', type: 'image/png' },
        ],
        apple: [
            { url: '/fruitful_logo_main.png', sizes: '180x180', type: 'image/png' },
        ],
        shortcut: '/fruitful_logo_main.png',
    },
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'format-detection': 'telephone=yes',
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
                            <PWAProvider>
                                {children}
                            </PWAProvider>
                        </ToastProvider>
                    </SupabaseAuthProvider>
                </QueryProvider>
            </body>
        </html>
    )
}

