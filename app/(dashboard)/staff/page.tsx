'use client';
import { useSchoolStore } from '@/lib/store';
import { StaffView } from '@/components/features/StaffView';

export default function StaffPage() {
    const { staff, addStaff, deleteStaff } = useSchoolStore();
    return <StaffView staff={staff} onAdd={addStaff} onDelete={deleteStaff} />;
}
