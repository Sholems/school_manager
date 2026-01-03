'use client';
import { StaffView } from '@/components/features/StaffView';
import { useStaff, useCreateStaff, useDeleteStaff } from '@/lib/hooks/use-data';

export default function StaffPage() {
    const { data: staff = [] } = useStaff();
    const { mutate: addStaff } = useCreateStaff();
    const { mutate: deleteStaff } = useDeleteStaff();

    return <StaffView staff={staff} onAdd={addStaff} onDelete={deleteStaff} />;
}
