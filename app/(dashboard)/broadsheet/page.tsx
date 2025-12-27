'use client';
import { useSchoolStore } from '@/lib/store';
import { BroadsheetView } from '@/components/features/BroadsheetView';

export default function BroadsheetPage() {
    const { students, classes, scores, settings } = useSchoolStore();
    return <BroadsheetView students={students} classes={classes} scores={scores} settings={settings} />;
}
