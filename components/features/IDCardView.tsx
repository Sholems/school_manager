'use client';

import React, { useState, useMemo } from 'react';
import {
    Printer, User, QrCode, CheckSquare, Square,
    CreditCard, Phone, Mail, MapPin, Calendar,
    RotateCcw, Palette
} from 'lucide-react';
import * as Types from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface IDCardViewProps {
    students: Types.Student[];
    classes: Types.Class[];
    settings: Types.Settings;
}

type CardTemplate = 'modern' | 'classic' | 'minimal';
type CardSide = 'front' | 'back' | 'both';

const TEMPLATES: { id: CardTemplate; name: string; description: string }[] = [
    { id: 'modern', name: 'Modern', description: 'Gradient header with rounded corners' },
    { id: 'classic', name: 'Classic', description: 'Traditional school card design' },
    { id: 'minimal', name: 'Minimal', description: 'Clean, simple layout' }
];

export const IDCardView: React.FC<IDCardViewProps> = ({ students, classes, settings }) => {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [template, setTemplate] = useState<CardTemplate>('modern');
    const [showSide, setShowSide] = useState<CardSide>('front');

    const activeStudents = students.filter(s => s.class_id === selectedClass);
    const currentClass = classes.find(c => c.id === selectedClass);

    const studentsToPrint = useMemo(() => {
        if (selectedStudents.size === 0) return activeStudents;
        return activeStudents.filter(s => selectedStudents.has(s.id));
    }, [activeStudents, selectedStudents]);

    const toggleStudent = (id: string) => {
        const newSet = new Set(selectedStudents);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedStudents(newSet);
    };

    const selectAll = () => {
        if (selectedStudents.size === activeStudents.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(activeStudents.map(s => s.id)));
        }
    };

    // Generate QR code data (simplified - in production use a QR library)
    const getQRData = (student: Types.Student) => {
        return JSON.stringify({
            id: student.student_no,
            name: student.names,
            class: currentClass?.name,
            school: settings.school_name
        });
    };

    // Calculate validity (current session)
    const validityPeriod = settings.current_session;

    const renderFrontCard = (student: Types.Student) => {
        const commonClasses = "relative w-[340px] h-[214px] bg-white rounded-xl overflow-hidden border shadow-lg print:shadow-none break-inside-avoid";

        if (template === 'modern') {
            return (
                <div className={`${commonClasses} border-gray-200`}>
                    {/* Header with gradient */}
                    <div className="absolute top-0 w-full h-[85px] bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 flex items-center px-5">
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-base uppercase tracking-wide leading-tight">
                                {settings.school_name}
                            </h3>
                            <p className="text-brand-100 text-[10px] mt-0.5">{settings.school_tagline}</p>
                            <p className="text-brand-200 text-[9px] mt-1">{settings.school_address}</p>
                        </div>
                        {settings.logo_media && (
                            <img
                                src={settings.logo_media}
                                className="h-14 w-14 object-contain bg-white rounded-full p-1.5 shadow-md"
                                alt="Logo"
                            />
                        )}
                    </div>

                    {/* Content area */}
                    <div className="absolute top-[85px] w-full h-[100px] p-4 flex gap-4">
                        {/* Photo */}
                        <div className="h-[90px] w-[72px] rounded-lg bg-gray-100 border-2 border-brand-200 overflow-hidden flex-shrink-0 shadow-sm -mt-8">
                            {student.passport_media ? (
                                <img src={student.passport_media} className="h-full w-full object-cover" alt="Photo" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                    <User className="h-10 w-10 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Student Info */}
                        <div className="flex-1 space-y-1">
                            <h2 className="text-lg font-bold text-gray-900 uppercase leading-tight truncate">
                                {student.names}
                            </h2>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                                <div>
                                    <span className="text-gray-400 uppercase text-[9px] font-medium">ID No.</span>
                                    <p className="text-gray-800 font-semibold">{student.student_no}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase text-[9px] font-medium">Class</span>
                                    <p className="text-gray-800 font-semibold">{currentClass?.name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase text-[9px] font-medium">Gender</span>
                                    <p className="text-gray-800">{student.gender}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 uppercase text-[9px] font-medium">D.O.B</span>
                                    <p className="text-gray-800">{new Date(student.dob).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code placeholder */}
                        <div className="h-14 w-14 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                            <QrCode className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 w-full h-[29px] bg-brand-900 flex items-center justify-between px-4">
                        <p className="text-brand-200 text-[9px] uppercase tracking-widest">Student Identity Card</p>
                        <p className="text-brand-300 text-[9px]">Valid: {validityPeriod}</p>
                    </div>
                </div>
            );
        }

        if (template === 'classic') {
            return (
                <div className={`${commonClasses} border-brand-800 border-2`}>
                    {/* Header */}
                    <div className="absolute top-0 w-full h-[70px] bg-brand-800 flex items-center justify-center gap-3 px-4">
                        {settings.logo_media && (
                            <img src={settings.logo_media} className="h-12 w-12 object-contain" alt="Logo" />
                        )}
                        <div className="text-center">
                            <h3 className="text-white font-bold text-sm uppercase">{settings.school_name}</h3>
                            <p className="text-brand-200 text-[10px]">{settings.school_address}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="absolute top-[70px] w-full h-[115px] p-3 flex gap-3 bg-brand-50">
                        <div className="h-[80px] w-[64px] border-2 border-brand-800 overflow-hidden flex-shrink-0 bg-white">
                            {student.passport_media ? (
                                <img src={student.passport_media} className="h-full w-full object-cover" alt="Photo" />
                            ) : (
                                <User className="h-full w-full p-3 text-gray-300" />
                            )}
                        </div>
                        <div className="flex-1 text-[11px] space-y-0.5">
                            <p><span className="font-bold text-brand-800">Name:</span> {student.names}</p>
                            <p><span className="font-bold text-brand-800">ID No:</span> {student.student_no}</p>
                            <p><span className="font-bold text-brand-800">Class:</span> {currentClass?.name}</p>
                            <p><span className="font-bold text-brand-800">D.O.B:</span> {new Date(student.dob).toLocaleDateString()}</p>
                            <p><span className="font-bold text-brand-800">Gender:</span> {student.gender}</p>
                        </div>
                        <div className="h-12 w-12 bg-brand-900 flex items-center justify-center flex-shrink-0">
                            <QrCode className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 w-full h-[29px] bg-brand-800 flex items-center justify-center">
                        <p className="text-white text-[10px] font-medium">Session: {validityPeriod}</p>
                    </div>
                </div>
            );
        }

        // Minimal template
        return (
            <div className={`${commonClasses} border-gray-300`}>
                <div className="p-5 flex gap-5 h-full">
                    {/* Photo */}
                    <div className="h-[100px] w-[80px] rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {student.passport_media ? (
                            <img src={student.passport_media} className="h-full w-full object-cover" alt="Photo" />
                        ) : (
                            <User className="h-full w-full p-4 text-gray-300" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {settings.logo_media && (
                                <img src={settings.logo_media} className="h-8 w-8 object-contain" alt="Logo" />
                            )}
                            <div>
                                <h4 className="text-[10px] font-medium text-gray-500 uppercase">{settings.school_name}</h4>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{student.names}</h2>
                        <div className="space-y-1 text-xs">
                            <p className="text-gray-600"><span className="text-gray-400">ID:</span> {student.student_no}</p>
                            <p className="text-gray-600"><span className="text-gray-400">Class:</span> {currentClass?.name}</p>
                        </div>
                    </div>

                    {/* QR */}
                    <div className="self-end">
                        <div className="h-12 w-12 bg-gray-900 rounded flex items-center justify-center">
                            <QrCode className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600"></div>
            </div>
        );
    };

    const renderBackCard = (student: Types.Student) => {
        const commonClasses = "relative w-[340px] h-[214px] bg-white rounded-xl overflow-hidden border shadow-lg print:shadow-none break-inside-avoid";

        return (
            <div className={`${commonClasses} ${template === 'classic' ? 'border-brand-800 border-2' : 'border-gray-200'}`}>
                {/* Header strip */}
                <div className={`absolute top-0 w-full h-8 ${template === 'classic' ? 'bg-brand-800' : 'bg-brand-600'} flex items-center justify-center`}>
                    <p className="text-white text-[10px] font-medium uppercase tracking-wider">
                        {settings.school_name}
                    </p>
                </div>

                {/* Content */}
                <div className="absolute top-8 w-full h-[148px] p-4">
                    <div className="grid grid-cols-2 gap-4 h-full">
                        {/* Emergency Contact */}
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-brand-700 uppercase border-b pb-1">
                                Emergency Contact
                            </h4>
                            <div className="space-y-1.5 text-[10px]">
                                <div className="flex items-start gap-1.5">
                                    <User className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{student.parent_name}</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                    <Phone className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{student.parent_phone}</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 leading-tight">{student.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* School Contact */}
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-brand-700 uppercase border-b pb-1">
                                School Contact
                            </h4>
                            <div className="space-y-1.5 text-[10px]">
                                <div className="flex items-start gap-1.5">
                                    <Phone className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{settings.school_phone}</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                    <Mail className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{settings.school_email}</span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 leading-tight">{settings.school_address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`absolute bottom-0 w-full h-[38px] ${template === 'classic' ? 'bg-brand-50' : 'bg-gray-50'} px-4 flex items-center justify-between border-t`}>
                    <p className="text-[9px] text-gray-500 italic max-w-[200px]">
                        If found, please return to the school address above.
                    </p>
                    <div className="text-right">
                        <p className="text-[8px] text-gray-400 uppercase">Valid Session</p>
                        <p className="text-[10px] font-bold text-brand-700">{validityPeriod}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student ID Cards</h1>
                    <p className="text-gray-500">Generate and print student identity cards</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Select
                        className="w-40"
                        value={selectedClass}
                        onChange={e => {
                            setSelectedClass(e.target.value);
                            setSelectedStudents(new Set());
                        }}
                    >
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>

                    <Select
                        className="w-36"
                        value={template}
                        onChange={e => setTemplate(e.target.value as CardTemplate)}
                    >
                        {TEMPLATES.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </Select>

                    <Button
                        variant="secondary"
                        onClick={() => setShowSide(showSide === 'front' ? 'back' : showSide === 'back' ? 'both' : 'front')}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {showSide === 'front' ? 'Front' : showSide === 'back' ? 'Back' : 'Both'}
                    </Button>

                    <Button onClick={() => window.print()}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print {selectedStudents.size > 0 ? `(${selectedStudents.size})` : 'All'}
                    </Button>
                </div>
            </div>

            {/* Template Preview */}
            <div className="no-print">
                <Card className="p-4">
                    <div className="flex items-center gap-6">
                        <Palette className="h-5 w-5 text-brand-600" />
                        <div className="flex gap-4">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${template === t.id
                                            ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 ml-auto">
                            {TEMPLATES.find(t => t.id === template)?.description}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Student Selection */}
            <div className="no-print">
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-700">Select Students</h3>
                        <button
                            onClick={selectAll}
                            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                            {selectedStudents.size === activeStudents.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {activeStudents.map(s => (
                            <button
                                key={s.id}
                                onClick={() => toggleStudent(s.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${selectedStudents.has(s.id)
                                        ? 'bg-brand-100 text-brand-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {selectedStudents.has(s.id)
                                    ? <CheckSquare className="h-4 w-4" />
                                    : <Square className="h-4 w-4" />
                                }
                                {s.names.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                    {selectedStudents.size > 0 && (
                        <p className="text-sm text-gray-500 mt-3">
                            {selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} selected for printing
                        </p>
                    )}
                </Card>
            </div>

            {/* Cards Grid */}
            <div className={`grid gap-6 print:gap-4 ${showSide === 'both'
                    ? 'grid-cols-1 md:grid-cols-2 print:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2'
                }`}>
                {studentsToPrint.map(s => (
                    <div key={s.id} className="flex flex-col gap-4 items-center">
                        {(showSide === 'front' || showSide === 'both') && renderFrontCard(s)}
                        {(showSide === 'back' || showSide === 'both') && renderBackCard(s)}
                    </div>
                ))}
                {studentsToPrint.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400 italic no-print">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No students found in this class.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
