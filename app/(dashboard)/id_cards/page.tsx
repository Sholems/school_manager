'use client';
import { useSchoolStore } from '@/lib/store';
import { IDCardView } from '@/components/features/IDCardView';

export default function IDCardsPage() {
    const { students, classes, settings } = useSchoolStore();
    return <IDCardView students={students} classes={classes} settings={settings} />;
}
