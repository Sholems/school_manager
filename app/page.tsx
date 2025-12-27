'use client';

import { useEffect, useState } from 'react';
import { LandingPage } from '@/components/features/LandingPage';
import * as Utils from '@/lib/utils';

export default function Page() {
    const [settings, setSettings] = useState(Utils.INITIAL_SETTINGS);
    const [stats, setStats] = useState({ studentsCount: 0, teachersCount: 0, classesCount: 0 });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const loadedSettings = Utils.loadFromStorage(Utils.STORAGE_KEYS.SETTINGS, Utils.INITIAL_SETTINGS);
        const loadedStudents = Utils.loadFromStorage(Utils.STORAGE_KEYS.STUDENTS, Utils.SEED_STUDENTS);
        const loadedTeachers = Utils.loadFromStorage(Utils.STORAGE_KEYS.TEACHERS, Utils.SEED_TEACHERS);
        const loadedClasses = Utils.loadFromStorage(Utils.STORAGE_KEYS.CLASSES, Utils.SEED_CLASSES);

        setSettings(loadedSettings);
        setStats({
            studentsCount: loadedStudents.length,
            teachersCount: loadedTeachers.length,
            classesCount: loadedClasses.length
        });
        setIsLoaded(true);
    }, []);

    if (!isLoaded) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-brand-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white/60 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return <LandingPage settings={settings} stats={stats} />;
}
