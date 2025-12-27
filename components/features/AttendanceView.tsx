import React, { useState, useEffect } from 'react';
import { Save, Calendar as CalendarIcon } from 'lucide-react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-provider';

interface AttendanceViewProps {
    students: Types.Student[];
    classes: Types.Class[];
    attendance: Types.Attendance[];
    settings: Types.Settings;
    onSave: (att: Types.Attendance[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
    students, classes, attendance, settings, onSave
}) => {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
    const [date, setDate] = useState(Utils.getTodayString());
    const { addToast } = useToast();
    const activeStudents = students.filter(s => s.class_id === selectedClass);
    const existingRecord = attendance.find(a => a.class_id === selectedClass && a.date === date && a.session === settings.current_session && a.term === settings.current_term);
    const [currentStatuses, setCurrentStatuses] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

    useEffect(() => {
        const initial: Record<string, 'present' | 'absent' | 'late'> = {};
        activeStudents.forEach(s => {
            const rec = existingRecord?.records.find(r => r.student_id === s.id);
            initial[s.id] = rec ? rec.status : 'present';
        });
        setCurrentStatuses(initial);
    }, [selectedClass, date, existingRecord, activeStudents.length]);

    const handleSave = () => {
        const records = activeStudents.map(s => ({ student_id: s.id, status: currentStatuses[s.id] || 'present' }));
        const newEntry: Types.Attendance = {
            id: existingRecord?.id || Utils.generateId(), date, class_id: selectedClass, session: settings.current_session, term: settings.current_term, records, created_at: existingRecord?.created_at || Date.now(), updated_at: Date.now()
        };
        const others = attendance.filter(a => a.id !== newEntry.id);
        onSave([...others, newEntry]);
        addToast('Attendance saved successfully', 'success');
    };

    const markAll = (status: 'present' | 'absent') => {
        const update = { ...currentStatuses };
        activeStudents.forEach(s => update[s.id] = status);
        setCurrentStatuses(update);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold text-gray-900">Attendance Register</h1><p className="text-gray-500">Daily roll call management</p></div>
                <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save Register</Button>
            </div>
            <Card>
                <div className="flex gap-4 mb-6 items-end border-b pb-4">
                    <div className="w-64"><Select label="Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
                    <div className="w-64"><Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                    <div className="flex-1 flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => markAll('present')}>Mark All Present</Button><Button size="sm" variant="secondary" onClick={() => markAll('absent')}>Mark All Absent</Button></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeStudents.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div><div className="font-bold text-gray-900">{s.names}</div><div className="text-xs text-gray-500">{s.student_no}</div></div>
                            <div className="flex bg-gray-100 rounded-md p-1">
                                {(['present', 'late', 'absent'] as const).map(status => (
                                    <button key={status} onClick={() => setCurrentStatuses(prev => ({ ...prev, [s.id]: status }))} className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${currentStatuses[s.id] === status ? (status === 'present' ? 'bg-green-500 text-white' : status === 'late' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white') : 'text-gray-500 hover:bg-gray-200'}`}>{status}</button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {activeStudents.length === 0 && <p className="text-gray-500 italic col-span-3 text-center py-8">No students in this class.</p>}
                </div>
            </Card>
        </div>
    );
};
