'use client';
import { useSchoolStore } from '@/lib/store';
import { SettingsView } from '@/components/features/SettingsView';

export default function SettingsPage() {
    const { settings, setSettings } = useSchoolStore();
    return <SettingsView settings={settings} onUpdate={setSettings} />;
}
