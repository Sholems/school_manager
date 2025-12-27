import React, { useRef } from 'react';
import { Download, Upload, Database } from 'lucide-react';
import * as Utils from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/providers/toast-provider';

export const DataManagementView: React.FC = () => {
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleExport = () => {
        const data = {
            settings: Utils.loadFromStorage(Utils.STORAGE_KEYS.SETTINGS, Utils.INITIAL_SETTINGS),
            students: Utils.loadFromStorage(Utils.STORAGE_KEYS.STUDENTS, Utils.SEED_STUDENTS),
            teachers: Utils.loadFromStorage(Utils.STORAGE_KEYS.TEACHERS, Utils.SEED_TEACHERS),
            staff: Utils.loadFromStorage(Utils.STORAGE_KEYS.STAFF, Utils.SEED_STAFF),
            classes: Utils.loadFromStorage(Utils.STORAGE_KEYS.CLASSES, Utils.SEED_CLASSES),
            scores: Utils.loadFromStorage(Utils.STORAGE_KEYS.SCORES, []),
            fees: Utils.loadFromStorage(Utils.STORAGE_KEYS.FEES, []),
            payments: Utils.loadFromStorage(Utils.STORAGE_KEYS.PAYMENTS, []),
            expenses: Utils.loadFromStorage(Utils.STORAGE_KEYS.EXPENSES, []),
            attendance: Utils.loadFromStorage(Utils.STORAGE_KEYS.ATTENDANCE, [])
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `school_backup_${Utils.getTodayString()}.json`; a.click();
        addToast('Backup downloaded successfully', 'success');
    };
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.settings && data.students) {
                    Utils.saveToStorage(Utils.STORAGE_KEYS.SETTINGS, data.settings);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.STUDENTS, data.students);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.TEACHERS, data.teachers);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.STAFF, data.staff);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.CLASSES, data.classes);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.SCORES, data.scores);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.FEES, data.fees);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.PAYMENTS, data.payments);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.EXPENSES, data.expenses);
                    Utils.saveToStorage(Utils.STORAGE_KEYS.ATTENDANCE, data.attendance);
                    addToast('Data imported successfully! Refreshing...', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } else { addToast('Invalid backup file format', 'error'); }
            } catch (err) { addToast('Error parsing file', 'error'); }
        };
        reader.readAsText(file);
    };
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
            <Card title="Backup & Restore">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50 border-blue-100">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Download className="h-6 w-6" /></div>
                        <div className="flex-1"><h3 className="font-bold text-gray-900">Export Data</h3><p className="text-sm text-gray-600">Download a complete JSON backup of all school records.</p></div>
                        <Button onClick={handleExport}>Download Backup</Button>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-orange-50 border-orange-100">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><Upload className="h-6 w-6" /></div>
                        <div className="flex-1"><h3 className="font-bold text-gray-900">Import Data</h3><p className="text-sm text-gray-600">Restore from a previously saved backup file. This will overwrite current data.</p></div>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Select File</Button>
                    </div>
                </div>
            </Card>
            <Card title="System Info">
                <div className="text-sm text-gray-500 space-y-2"><p>Storage Engine: LocalStorage (Browser)</p><p>Last Sync: {new Date().toLocaleString()}</p><p className="text-red-500 text-xs mt-4">* Warning: Clearing browser cache will delete all data if not backed up.</p></div>
            </Card>
        </div>
    );
};
