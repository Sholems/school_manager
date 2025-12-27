import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/providers/toast-provider';

interface StaffViewProps {
    staff: Types.Staff[];
    onAdd: (s: Types.Staff) => void;
    onDelete: (id: string) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ staff, onAdd, onDelete }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', tasks: '', email: '', phone: '', address: '' });
    const { addToast } = useToast();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ ...formData, id: Utils.generateId(), created_at: Date.now(), updated_at: Date.now() });
        addToast('Staff member added successfully', 'success');
        setShowModal(false); setFormData({ name: '', role: '', tasks: '', email: '', phone: '', address: '' });
    };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Non-Academic Staff</h1><p className="text-gray-500">Manage support staff and roles</p></div><Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Staff</Button></div>
            <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {staff.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-gray-900">{s.name}</td><td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{s.role}</span></td><td className="px-4 py-3 text-xs">{s.phone}</td><td className="px-4 py-3 text-right"><button onClick={() => onDelete(s.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Staff">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4"><Input label="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /><Input label="Job Title/Role" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} /></div>
                    <Input label="Assigned Tasks" value={formData.tasks} onChange={e => setFormData({ ...formData, tasks: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4"><Input label="Phone" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /><Input label="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                    <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    <Button type="submit" className="w-full">Save Staff Member</Button>
                </form>
            </Modal>
        </div>
    );
};
