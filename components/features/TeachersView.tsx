import React, { useState } from 'react';
import { Plus, Trash2, Phone, MapPin, Edit, User } from 'lucide-react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { useToast } from '@/components/providers/toast-provider';

interface TeachersViewProps {
    teachers: Types.Teacher[];
    onAdd: (t: Types.Teacher) => void;
    onUpdate: (t: Types.Teacher) => void;
    onDelete: (id: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ teachers, onAdd, onUpdate, onDelete }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Types.Teacher>>({
        name: '', email: '', phone: '', address: '', passport_url: null
    });
    const { addToast } = useToast();

    const handleEdit = (t: Types.Teacher) => {
        setFormData(t);
        setEditingId(t.id);
        setShowModal(true);
    };

    const handleCreate = () => {
        setFormData({ name: '', email: '', phone: '', address: '', passport_url: null });
        setEditingId(null);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdate({ ...formData as Types.Teacher, updated_at: Date.now() });
            addToast('Teacher updated successfully', 'success');
        } else {
            onAdd({
                ...formData as Types.Teacher,
                id: Utils.generateId(),
                created_at: Date.now(),
                updated_at: Date.now()
            });
            addToast('Teacher added successfully', 'success');
        }
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', address: '', passport_url: null });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Teachers Directory</h1>
                    <p className="text-gray-500">Manage academic staff</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" /> Add Teacher
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map(t => (
                    <Card key={t.id} className="flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-purple-200">
                                    {t.passport_url ? (
                                        <img src={t.passport_url} alt={t.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-7 w-7" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Teacher</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-brand-600 transition-colors p-1">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDelete(t.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" /> {t.phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 flex items-center justify-center">@</div> {t.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> {t.address}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Teacher" : "Add New Teacher"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <PhotoUpload
                            value={formData.passport_url}
                            onChange={photo => setFormData({ ...formData, passport_url: photo })}
                            label="Passport Photo"
                            size="lg"
                        />
                    </div>
                    <Input
                        label="Full Name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Phone Number"
                            required
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Residential Address"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                    <Button type="submit" className="w-full">
                        {editingId ? 'Update Teacher' : 'Save Teacher'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

