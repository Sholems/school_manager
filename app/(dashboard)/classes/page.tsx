'use client';

import React from 'react';
import { useSchoolStore } from '@/lib/store';
import { ClassesView } from '@/components/features/ClassesView';

export default function ClassesPage() {
    const {
        classes, teachers, updateClass
    } = useSchoolStore();

    return (
        <ClassesView
            classes={classes}
            teachers={teachers}
            onUpdate={updateClass}
        />
    );
}
