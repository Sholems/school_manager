'use client';

import React from 'react';
import { useSchoolStore } from '@/lib/store';
import { DashboardView } from '@/components/features/DashboardView';
import { TeacherDashboardView } from '@/components/features/TeacherDashboardView';
import { StudentDashboardView } from '@/components/features/StudentDashboardView';
import { SuperAdminDashboardView } from '@/components/features/SuperAdminDashboardView';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const {
        students, teachers, staff, payments, expenses, fees, classes, settings, currentRole
    } = useSchoolStore();

    // Super Admin gets the full console with CMS and Role management
    if (currentRole === 'super_admin') {
        return <SuperAdminDashboardView />;
    }

    if (currentRole === 'teacher') {
        return <TeacherDashboardView />;
    }

    if (currentRole === 'student' || currentRole === 'parent') {
        return <StudentDashboardView />;
    }

    // Admin and other roles get the regular dashboard
    return (
        <DashboardView
            students={students}
            teachers={teachers}
            staff={staff}
            payments={payments}
            expenses={expenses}
            fees={fees}
            classes={classes}
            settings={settings}
            onChangeView={(view) => {
                const path = view === 'dashboard' ? '/dashboard' : `/${view}`;
                router.push(path);
            }}
        />
    );
}

