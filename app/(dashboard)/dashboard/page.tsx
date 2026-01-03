'use client';

import React from 'react';
import { useSchoolStore } from '@/lib/store';
import { DashboardView } from '@/components/features/DashboardView';
import { TeacherDashboardView } from '@/components/features/TeacherDashboardView';
import { StudentDashboardView } from '@/components/features/StudentDashboardView';
import { StaffDashboardView } from '@/components/features/StaffDashboardView';
import {
    useStudents, useTeachers, useStaff, usePayments,
    useExpenses, useFees, useClasses, useSettings
} from '@/lib/hooks/use-data';
import * as Utils from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const { currentRole } = useSchoolStore();

    const { data: students = [] } = useStudents();
    const { data: teachers = [] } = useTeachers();
    const { data: staff = [] } = useStaff();
    const { data: payments = [] } = usePayments();
    const { data: expenses = [] } = useExpenses();
    const { data: fees = [] } = useFees();
    const { data: classes = [] } = useClasses();
    const { data: settings = Utils.INITIAL_SETTINGS } = useSettings();

    if (currentRole === 'teacher') {
        return <TeacherDashboardView />;
    }

    if (currentRole === 'student' || currentRole === 'parent') {
        return <StudentDashboardView />;
    }

    if (currentRole === 'staff') {
        return <StaffDashboardView />;
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

