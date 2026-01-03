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
    const [formData, setFormData] = useState({ name: '', role: '', tasks: '', email: '', phone: '', address: '', assigned_modules: [] as string[], passport_url: null as string | null });
    const { addToast } = useToast();

    const availableModules = [
        { id: 'students', label: 'Student Records' },
        { id: 'teachers', label: 'Teacher Records' },
        { id: 'classes', label: 'Class Management' },
        { id: 'grading', label: 'Grading & Reports' },
        { id: 'attendance', label: 'Attendance Management' },
        { id: 'bursary', label: 'Bursary / Fees' },
        { id: 'announcements', label: 'Announcements' },
        { id: 'calendar', label: 'School Calendar' },
        { id: 'id_cards', label: 'ID Cards' },
        { id: 'broadsheet', label: 'Broadsheet' },
        { id: 'data', label: 'System Data' },
        { id: 'newsletter', label: 'Newsletter' },
        { id: 'inventory', label: 'Inventory (Coming Soon)' },
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, passport_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleModule = (moduleId: string) => {
        setFormData(prev => ({
            ...prev,
            assigned_modules: prev.assigned_modules.includes(moduleId)
                ? prev.assigned_modules.filter(m => m !== moduleId)
                : [...prev.assigned_modules, moduleId]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ ...formData, id: Utils.generateId(), created_at: Date.now(), updated_at: Date.now() });
        addToast('Staff member added successfully', 'success');
        setShowModal(false);
        setFormData({ name: '', role: '', tasks: '', email: '', phone: '', address: '', assigned_modules: [], passport_url: null });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Non-Academic Staff</h1><p className="text-gray-500">Manage support staff and roles</p></div><Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Staff</Button></div>
            <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium"><tr><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Access Modules</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                        {staff.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-3">
                                    {s.passport_url ? (
                                        <img src={s.passport_url} alt={s.name} className="w-8 h-8 rounded-full object-cover border" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">{s.name.charAt(0)}</div>
                                    )}
                                    {s.name}
                                </td>
                                <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{s.role}</span></td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {s.assigned_modules?.map(m => (
                                            <span key={m} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">{m}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs">{s.phone}</td>
                                <td className="px-4 py-3 text-right"><button onClick={() => onDelete(s.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Staff">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                {formData.passport_url ? (
                                    <img src={formData.passport_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-xs text-center px-2">Click to upload photo</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4"><Input label="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /><Input label="Job Title/Role" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} /></div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Assign System Access</label>
                        <div className="grid grid-cols-2 gap-2">
                            {availableModules.map(module => (
                                <label key={module.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-brand-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.assigned_modules.includes(module.id)}
                                        onChange={() => toggleModule(module.id)}
                                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-xs font-medium text-gray-700">{module.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Input label="Assigned Tasks" value={formData.tasks} onChange={e => setFormData({ ...formData, tasks: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4"><Input label="Phone" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /><Input label="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                    <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    <Button type="submit" className="w-full">Save Staff Member</Button>
                </form>
            </Modal>
        </div>
    );
};
