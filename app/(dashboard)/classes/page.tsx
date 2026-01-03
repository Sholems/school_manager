'use client';

import React from 'react';
import { useClasses, useTeachers, useCreateClass, useUpdateClass } from '@/lib/hooks/use-data';
import { ClassesView } from '@/components/features/ClassesView';

export default function ClassesPage() {
    const { data: classes = [], isLoading: classesLoading } = useClasses();
    const { data: teachers = [] } = useTeachers();
    const createClassMutation = useCreateClass();
    const updateClassMutation = useUpdateClass();

    // DEBUG
    console.log('[ClassesPage] Query - classes count:', classes.length, 'loading:', classesLoading);

    if (classesLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <ClassesView
            classes={classes}
            teachers={teachers}
            onUpdate={(cls) => updateClassMutation.mutate({ id: cls.id, updates: cls })}
            onCreate={async (cls) => { await createClassMutation.mutateAsync(cls); }}
        />
    );
}
