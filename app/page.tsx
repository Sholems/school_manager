'use client';

import { useEffect, useState } from 'react';
import { LandingPage } from '@/components/features/LandingPage';
import * as Utils from '@/lib/utils';
import { useSettings, useStudents, useTeachers, useClasses } from '@/lib/hooks/use-data';
import Script from 'next/script';

// JSON-LD Structured Data for SEO
const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://fruitfulvineheritageschools.org.ng",
    "name": "Fruitful Vine Heritage Schools",
    "alternateName": "FVHS",
    "description": "A faith-based school dedicated to nurturing academic excellence, moral integrity, and godly character. We offer Crèche, Pre-School and Primary education in Badagry, Lagos, Nigeria.",
    "url": "https://fruitfulvineheritageschools.org.ng",
    "logo": "https://fruitfulvineheritageschools.org.ng/fruitful_logo_main.png",
    "image": "https://fruitfulvineheritageschools.org.ng/opengraph-image",
    "telephone": "+234-XXX-XXX-XXXX",
    "email": "info@fruitfulvineheritageschools.org.ng",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Badagry",
        "addressLocality": "Lagos",
        "addressRegion": "Lagos State",
        "addressCountry": "NG"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": "6.4183",
        "longitude": "2.8855"
    },
    "sameAs": [],
    "areaServed": {
        "@type": "City",
        "name": "Badagry, Lagos"
    },
    "priceRange": "₦₦",
    "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "07:30",
        "closes": "15:00"
    },
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Educational Programs",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "EducationalOccupationalProgram",
                    "name": "Crèche",
                    "description": "Early childhood care for infants and toddlers"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "EducationalOccupationalProgram",
                    "name": "Pre-School",
                    "description": "Foundation education for children ages 3-5"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "EducationalOccupationalProgram",
                    "name": "Primary School",
                    "description": "Primary education from Grade 1 to 6"
                }
            }
        ]
    }
};

export default function Page() {
    // Use TanStack Query - renders immediately with defaults, updates when data loads
    const { data: settings = Utils.INITIAL_SETTINGS } = useSettings();
    const { data: students = [] } = useStudents();
    const { data: teachers = [] } = useTeachers();
    const { data: classes = [] } = useClasses();

    const stats = {
        studentsCount: students.length,
        teachersCount: teachers.length,
        classesCount: classes.length
    };

    // Render immediately with defaults - no loading spinner!
    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <LandingPage settings={settings} stats={stats} />
        </>
    );
}
