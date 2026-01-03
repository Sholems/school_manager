'use client';

import { useEffect, useState } from 'react';
import { LandingPage } from '@/components/features/LandingPage';
import * as Utils from '@/lib/utils';
import { useSettings, useStudents, useTeachers, useClasses } from '@/lib/hooks/use-data';

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
    return <LandingPage settings={settings} stats={stats} />;
}
