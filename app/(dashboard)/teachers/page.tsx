'use client';
import { TeachersView } from '@/components/features/TeachersView';
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from '@/lib/hooks/use-data';
import * as Types from '@/lib/types';

export default function TeachersPage() {
    const { data: teachers = [] } = useTeachers();
    const { mutate: addTeacher } = useCreateTeacher();
    const { mutate: performUpdate } = useUpdateTeacher();
    const { mutate: deleteTeacher } = useDeleteTeacher();

    const updateTeacher = (teacher: Types.Teacher) => {
        performUpdate({ id: teacher.id, updates: teacher });
    };

    return <TeachersView teachers={teachers} onAdd={addTeacher} onUpdate={updateTeacher} onDelete={deleteTeacher} />;
}
