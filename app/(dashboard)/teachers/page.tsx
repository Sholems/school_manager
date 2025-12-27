'use client';
import { useSchoolStore } from '@/lib/store';
import { TeachersView } from '@/components/features/TeachersView';

export default function TeachersPage() {
    const { teachers, addTeacher, updateTeacher, deleteTeacher } = useSchoolStore();
    return <TeachersView teachers={teachers} onAdd={addTeacher} onUpdate={updateTeacher} onDelete={deleteTeacher} />;
}
