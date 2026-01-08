'use client';

import React from 'react';
import { useStudents, useClasses, useCreateStudent, useUpdateStudent, useDeleteStudent } from '@/lib/hooks/use-data';
import { StudentsView } from '@/components/features/StudentsView';

export default function StudentsPage() {
    const { data: students = [], isLoading: studentsLoading } = useStudents();
    const { data: classes = [] } = useClasses();
    const createStudentMutation = useCreateStudent();
    const updateStudentMutation = useUpdateStudent();
    const deleteStudentMutation = useDeleteStudent();

    if (studentsLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <StudentsView
            students={students}
            classes={classes}
            onAdd={(student) => createStudentMutation.mutateAsync(student)}
            onUpdate={(student) => updateStudentMutation.mutate({ id: student.id, updates: student })}
            onDelete={(id) => deleteStudentMutation.mutate(id)}
        />
    );
}
