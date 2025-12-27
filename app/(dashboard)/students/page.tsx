'use client';

import React from 'react';
import { useSchoolStore } from '@/lib/store';
import { StudentsView } from '@/components/features/StudentsView';

export default function StudentsPage() {
    const {
        students, classes, addStudent, updateStudent, deleteStudent
    } = useSchoolStore();

    return (
        <StudentsView
            students={students}
            classes={classes}
            onAdd={addStudent}
            onUpdate={updateStudent}
            onDelete={deleteStudent}
        />
    );
}
