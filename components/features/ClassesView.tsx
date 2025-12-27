import React, { useState } from 'react';
import { BookOpen, User, Library, Search } from 'lucide-react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/providers/toast-provider';

interface ClassesViewProps {
    classes: Types.Class[];
    teachers: Types.Teacher[];
    onUpdate: (c: Types.Class) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ classes, teachers, onUpdate }) => {
    const [editingClass, setEditingClass] = useState<Types.Class | null>(null);
    const [searchSubject, setSearchSubject] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const { addToast } = useToast();

    const allKnownSubjects = Array.from(new Set([
        ...Utils.PRESET_PRESCHOOL_SUBJECTS,
        ...Utils.PRESET_PRIMARY_SUBJECTS,
        'French', 'Music', 'Phonics', 'Handwriting', 'Diction', 'Home Economics', 'Agricultural Science',
        'History', 'Geography', 'Literature', 'Coding/Robotics'
    ])).sort();

    const handleEdit = (cls: Types.Class) => {
        const currentSubjects = cls.subjects ?? Utils.getSubjectsForClass(cls);
        setEditingClass({ ...cls, subjects: currentSubjects });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClass) {
            onUpdate({ ...editingClass, updated_at: Date.now() });
            addToast('Class configuration updated', 'success');
            setEditingClass(null);
        }
    };

    const toggleSubject = (subj: string) => {
        if (!editingClass) return;
        const current = editingClass.subjects || [];
        if (current.includes(subj)) {
            setEditingClass({ ...editingClass, subjects: current.filter(s => s !== subj) });
        } else {
            setEditingClass({ ...editingClass, subjects: [...current, subj] });
        }
    };

    const applyPreset = (type: 'nursery' | 'primary') => {
        if (!editingClass) return;
        const subjects = type === 'nursery' ? Utils.PRESET_PRESCHOOL_SUBJECTS : Utils.PRESET_PRIMARY_SUBJECTS;
        setEditingClass({ ...editingClass, subjects: [...subjects] });
    };

    const addCustomSubject = () => {
        if (!editingClass || !newSubject.trim()) return;
        const subj = newSubject.trim();
        const current = editingClass.subjects || [];
        if (!current.includes(subj)) {
            setEditingClass({ ...editingClass, subjects: [...current, subj] });
            addToast(`Added ${subj}`, 'success');
        }
        setNewSubject('');
    };

    const activeSubjects = editingClass?.subjects || [];
    const filteredPool = allKnownSubjects.filter(s => s.toLowerCase().includes(searchSubject.toLowerCase()));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Class & Subject Configuration</h1>
                <p className="text-gray-500">Assign teachers and manage subjects for each class.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classes.map(c => {
                    const teacher = teachers.find(t => t.id === c.class_teacher_id);
                    const subjectCount = (c.subjects ?? Utils.getSubjectsForClass(c)).length;
                    return (
                        <Card key={c.id} className="hover:border-brand-400 transition-all cursor-pointer group" >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-xl text-gray-800">{c.name}</h3>
                                        <div className="bg-gray-100 p-2 rounded-full group-hover:bg-brand-50 transition-colors"><BookOpen className="h-5 w-5 text-gray-500 group-hover:text-brand-600" /></div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {teacher ? <span className="font-medium text-brand-700">{teacher.name}</span> : <span className="italic text-gray-400">No Class Teacher</span>}
                                    </div>
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">{subjectCount} Subjects</span>
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(c)}>Configure</Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Modal isOpen={!!editingClass} onClose={() => setEditingClass(null)} title={`Configure ${editingClass?.name}`} size="lg">
                {editingClass && (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <Select label="Class Teacher" value={editingClass.class_teacher_id || ''} onChange={e => setEditingClass({ ...editingClass, class_teacher_id: e.target.value || null })}>
                                <option value="">-- Select Teacher --</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2"><Library className="h-4 w-4" /> Assigned Subjects</h4>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => applyPreset('nursery')} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 font-medium">Reset to Nursery</button>
                                    <button type="button" onClick={() => applyPreset('primary')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 font-medium">Reset to Primary</button>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <input className="flex-1 h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-brand-500 focus:outline-none" placeholder="Add custom subject..." value={newSubject} onChange={e => setNewSubject(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubject(); } }} />
                                <Button type="button" size="sm" onClick={addCustomSubject}>Add</Button>
                            </div>
                            <div className="mb-2 relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <input className="w-full h-9 pl-9 rounded-md border border-gray-300 text-sm focus:ring-brand-500 focus:outline-none" placeholder="Filter subjects..." value={searchSubject} onChange={e => setSearchSubject(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto border rounded-md p-4 bg-gray-50/50">
                                {filteredPool.map(subj => {
                                    const isActive = activeSubjects.includes(subj);
                                    return (
                                        <label key={subj} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${isActive ? 'bg-brand-50 text-brand-900 font-medium border border-brand-200' : 'hover:bg-gray-100 text-gray-600 border border-transparent'}`}>
                                            <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4" checked={isActive} onChange={() => toggleSubject(subj)} />
                                            {subj}
                                        </label>
                                    );
                                })}
                                {activeSubjects.filter(s => !allKnownSubjects.includes(s) && !s.toLowerCase().includes(searchSubject.toLowerCase())).map(subj => (
                                    <label key={subj} className="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm bg-brand-50 text-brand-900 font-medium border border-brand-200">
                                        <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4" checked={true} onChange={() => toggleSubject(subj)} />
                                        {subj} (Custom)
                                    </label>
                                ))}
                            </div>
                            <div className="mt-2 text-right text-xs text-gray-500">{activeSubjects.length} subjects selected</div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="secondary" onClick={() => setEditingClass(null)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};
