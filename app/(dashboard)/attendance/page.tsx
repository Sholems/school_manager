'use client';
import { useSchoolStore } from '@/lib/store';
import { AttendanceView } from '@/components/features/AttendanceView';

export default function AttendancePage() {
    const { students, classes, attendance, settings, setAttendance } = useSchoolStore();
    return <AttendanceView students={students} classes={classes} attendance={attendance} settings={settings} onSave={setAttendance} />;
}
