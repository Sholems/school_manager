import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Save, Printer } from 'lucide-react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ReportCardTemplate } from './grading/ReportCardTemplate';

const ScoreInput = ({ value, max, onChange, className }: { value: number, max: number, onChange: (val: number) => void, className?: string }) => {
    const [localValue, setLocalValue] = useState(value?.toString() || '');

    useEffect(() => {
        setLocalValue(value?.toString() || '');
    }, [value]);

    const handleBlur = () => {
        let v = parseFloat(localValue);
        if (isNaN(v)) v = 0;
        if (v > max) v = max;
        if (v !== value) {
            onChange(v);
        }
    };

    return (
        <input
            type="number"
            min="0"
            max={max}
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            className={`w-16 h-8 text-center border rounded focus:ring-2 focus:ring-brand-500 focus:outline-none ${className}`}
        />
    );
};

interface GradingViewProps {
    students: Types.Student[];
    classes: Types.Class[];
    scores: Types.Score[];
    settings: Types.Settings;
    onUpsertScore: (score: Types.Score) => void;
}

export const GradingView: React.FC<GradingViewProps> = ({
    students, classes, scores, settings, onUpsertScore
}) => {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
    const currentClass = classes.find(c => c.id === selectedClass);
    const classSubjects = Utils.getSubjectsForClass(currentClass);

    const [selectedSubject, setSelectedSubject] = useState(classSubjects[0] || '');
    const [activeTab, setActiveTab] = useState<'broadsheet' | 'report' | 'skills'>('broadsheet');
    const [reportStudentId, setReportStudentId] = useState('');

    const activeStudents = students.filter(s => s.class_id === selectedClass);

    // Ensure selectedClass is set when classes load
    useEffect(() => {
        if (classes.length > 0 && !selectedClass) {
            setSelectedClass(classes[0].id);
        }
    }, [classes, selectedClass]);



    useEffect(() => {
        if (classSubjects.length > 0 && !classSubjects.includes(selectedSubject)) {
            setSelectedSubject(classSubjects[0]);
        }
    }, [selectedClass, classSubjects, selectedSubject]);

    const handleScoreChange = (studentId: string, field: 'ca1' | 'ca2' | 'exam', value: number) => {
        let score = scores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);

        let newScore = score ? JSON.parse(JSON.stringify(score)) : {
            id: Utils.generateId(),
            student_id: studentId,
            class_id: selectedClass,
            session: settings.current_session,
            term: settings.current_term,
            rows: [],
            average: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            affective: {},
            psychomotor: {}
        };

        let rowIndex = newScore.rows.findIndex((r: any) => r.subject === selectedSubject);
        if (rowIndex === -1) {
            newScore.rows.push({ subject: selectedSubject, ca1: 0, ca2: 0, exam: 0, total: 0, grade: 'F', comment: '' });
            rowIndex = newScore.rows.length - 1;
        }
        const row = newScore.rows[rowIndex];
        (row as any)[field] = value;
        row.total = row.ca1 + row.ca2 + row.exam;
        const { grade, comment } = Utils.calculateGrade(row.total);
        row.grade = grade;
        row.comment = comment;
        const totalScore = newScore.rows.reduce((acc: number, r: any) => acc + r.total, 0);
        newScore.average = totalScore / newScore.rows.length;
        newScore.total_score = totalScore;
        onUpsertScore(newScore);
    };

    const handleTraitChange = (studentId: string, category: 'affective' | 'psychomotor', trait: string, value: number) => {
        let score = scores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);

        let newScore = score ? { ...score, [category]: { ...score[category] } } : {
            id: Utils.generateId(),
            student_id: studentId,
            class_id: selectedClass,
            session: settings.current_session,
            term: settings.current_term,
            rows: [],
            average: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            affective: {},
            psychomotor: {}
        };

        if (!newScore[category]) newScore[category] = {};
        newScore[category][trait] = value;
        onUpsertScore(newScore);
    };

    const handleScoreFieldChange = (studentId: string, field: keyof Types.Score, value: any) => {
        let score = scores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);

        let newScore = score ? { ...score } : {
            id: Utils.generateId(),
            student_id: studentId,
            class_id: selectedClass,
            session: settings.current_session,
            term: settings.current_term,
            rows: [],
            average: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            affective: {},
            psychomotor: {}
        };

        (newScore as any)[field] = value;
        onUpsertScore(newScore);
    };

    const getRow = (studentId: string) => {
        const score = scores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);
        return score?.rows.find(r => r.subject === selectedSubject) || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', comment: '-' };
    };

    // Compute preview score for single student view using useMemo for reliable synchronous updates
    const previewScore = useMemo(() => {
        if (!reportStudentId || reportStudentId === 'all') return null;

        const score = scores.find(s =>
            s.student_id === reportStudentId &&
            s.session === settings.current_session &&
            s.term === settings.current_term
        );

        if (score) {
            return {
                ...score,
                position: Utils.getStudentPosition(reportStudentId, students, scores, settings.current_session, settings.current_term) || undefined
            };
        }

        // Return default empty score for students without scores
        return {
            id: 'temp',
            student_id: reportStudentId,
            class_id: selectedClass,
            session: settings.current_session,
            term: settings.current_term,
            rows: [],
            average: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            affective: {},
            psychomotor: {},
        } as Types.Score;
    }, [reportStudentId, scores, settings.current_session, settings.current_term, selectedClass, students]);

    // Compute selected student for report card preview
    const selectedStudent = useMemo(() => {
        if (!reportStudentId || reportStudentId === 'all') return null;
        return students.find(s => s.id === reportStudentId) || null;
    }, [reportStudentId, students]);

    const handlePrint = () => {
        const reportCard = document.getElementById('report-card');
        if (!reportCard) {
            alert('Report card not found');
            return;
        }

        // Open a new window for printing
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            alert('Please allow pop-ups to print');
            return;
        }

        // Clone the content
        const content = reportCard.cloneNode(true) as HTMLElement;

        // Get all stylesheets from the current page
        const allStyles = Array.from(document.styleSheets)
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch {
                    // External stylesheets may throw CORS errors
                    return '';
                }
            })
            .join('\n');

        // Write the print document with all styles
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Report Card - ${settings.school_name}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    ${allStyles}
                    
                    /* Additional print-specific overrides */
                    @page { 
                        size: A4;
                        margin: 10mm;
                    }
                    
                    body { 
                        font-family: 'Inter', sans-serif;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Ensure watermark shows */
                    .absolute { position: absolute !important; }
                    .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
                    .pointer-events-none { pointer-events: none !important; }
                    [class*="opacity-"] { opacity: inherit !important; }
                    .opacity-\\[0\\.03\\] { opacity: 0.03 !important; }
                    .opacity-\\[0\\.05\\] { opacity: 0.05 !important; }
                    
                    /* Hide screen-only elements */
                    .print\\:hidden { display: none !important; }
                    
                    /* Ensure images load */
                    img { 
                        max-width: 100% !important; 
                        height: auto !important;
                    }
                    
                    /* Remove shadows and borders for print */
                    .shadow-lg { box-shadow: none !important; }
                    .border { border: 1px solid #e5e7eb !important; }
                </style>
            </head>
            <body>
                ${content.outerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();

        // Wait for images to load, then print
        printWindow.onload = () => {
            // Wait a bit longer to ensure images (watermark, logo) are loaded
            setTimeout(() => {
                printWindow.print();
            }, 800);
        };
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-900">Academic Grading</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('broadsheet')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'broadsheet' ? 'bg-white shadow text-brand-700' : 'text-gray-600'}`}>Score Entry</button>
                    <button onClick={() => setActiveTab('skills')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'skills' ? 'bg-white shadow text-brand-700' : 'text-gray-600'}`}>Skills & Behavior</button>
                    <button onClick={() => setActiveTab('report')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'report' ? 'bg-white shadow text-brand-700' : 'text-gray-600'}`}>Report Cards</button>
                </div>
            </div>
            {activeTab === 'broadsheet' && (
                <Card className="min-h-[600px] flex flex-col">
                    <div className="flex gap-4 mb-6 p-4 bg-gray-50 border-b">
                        <div className="w-1/3">
                            <Select label="Select Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                        </div>
                        <div className="w-1/3">
                            <Select label="Select Subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-4 py-3 sticky left-0 bg-gray-100">Student Name</th>
                                    <th className="px-4 py-3 text-center">HW/CW (20)</th>
                                    <th className="px-4 py-3 text-center">CAT (20)</th>
                                    <th className="px-4 py-3 text-center">Exam (60)</th>
                                    <th className="px-4 py-3 text-center">Total (100)</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                    <th className="px-4 py-3">Remark</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activeStudents.map(s => {
                                    const row = getRow(s.id);
                                    return (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white">{s.names} <div className="text-xs text-gray-500 font-normal">{s.student_no}</div></td>
                                            <td className="px-4 py-2 text-center"><ScoreInput value={row.ca1} max={20} onChange={(v) => handleScoreChange(s.id, 'ca1', v)} /></td>
                                            <td className="px-4 py-2 text-center"><ScoreInput value={row.ca2} max={20} onChange={(v) => handleScoreChange(s.id, 'ca2', v)} /></td>
                                            <td className="px-4 py-2 text-center"><ScoreInput value={row.exam} max={60} onChange={(v) => handleScoreChange(s.id, 'exam', v)} /></td>
                                            <td className="px-4 py-2 text-center font-bold"><span className={row.total < 40 ? 'text-red-600' : 'text-gray-900'}>{row.total}</span></td>
                                            <td className="px-4 py-2 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${row.grade === 'A' ? 'bg-green-100 text-green-800' : row.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{row.grade}</span></td>
                                            <td className="px-4 py-2 text-xs text-gray-500">{row.comment}</td>
                                        </tr>
                                    );
                                })}
                                {activeStudents.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-500">No students in this class.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'skills' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <Card title="Select Student">
                            <div className="space-y-4">
                                <Select label="Class" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setReportStudentId(''); }}>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                                <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-md">
                                    {activeStudents.map(s => (
                                        <button key={s.id} onClick={() => setReportStudentId(s.id)} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between ${reportStudentId === s.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'}`}>{s.names}<ChevronRight className="h-4 w-4 opacity-50" /></button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        {reportStudentId ? (
                            <>
                                <Card title="Affective Domain (Behavior & Traits)">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Utils.DOMAINS_AFFECTIVE.map(trait => {
                                            const score = scores.find(s => s.student_id === reportStudentId && s.session === settings.current_session && s.term === settings.current_term);
                                            const value = score?.affective?.[trait] || 0;
                                            return (
                                                <div key={trait} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">{trait}</span>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(num => (
                                                            <button
                                                                key={num}
                                                                onClick={() => handleTraitChange(reportStudentId, 'affective', trait, num)}
                                                                className={`h-8 w-8 rounded-md text-sm font-bold transition-colors ${value === num ? 'bg-brand-600 text-white' : 'bg-white border text-gray-400 hover:border-brand-300'}`}
                                                            >
                                                                {num}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                                <Card title="Psychomotor Skills (Physical & Creative)">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Utils.DOMAINS_PSYCHOMOTOR.map(skill => {
                                            const score = scores.find(s => s.student_id === reportStudentId && s.session === settings.current_session && s.term === settings.current_term);
                                            const value = score?.psychomotor?.[skill] || 0;
                                            return (
                                                <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-sm font-medium text-gray-700">{skill}</span>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(num => (
                                                            <button
                                                                key={num}
                                                                onClick={() => handleTraitChange(reportStudentId, 'psychomotor', skill, num)}
                                                                className={`h-8 w-8 rounded-md text-sm font-bold transition-colors ${value === num ? 'bg-brand-600 text-white' : 'bg-white border text-gray-400 hover:border-brand-300'}`}
                                                            >
                                                                {num}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                                <Card title="Attendance & Remarks">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Times Present</label>
                                                <input
                                                    type="number"
                                                    value={scores.find(s => s.student_id === reportStudentId && s.session === settings.current_session && s.term === settings.current_term)?.attendance_present || 0}
                                                    onChange={e => handleScoreFieldChange(reportStudentId, 'attendance_present', parseInt(e.target.value) || 0)}
                                                    className="w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Total Times School Opened</label>
                                                <input
                                                    type="number"
                                                    value={scores.find(s => s.student_id === reportStudentId && s.session === settings.current_session && s.term === settings.current_term)?.attendance_total || 0}
                                                    onChange={e => handleScoreFieldChange(reportStudentId, 'attendance_total', parseInt(e.target.value) || 0)}
                                                    className="w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">{settings.class_teacher_label} Remark</label>
                                            <textarea
                                                value={scores.find(s => s.student_id === reportStudentId && s.session === settings.current_session && s.term === settings.current_term)?.teacher_remark || ''}
                                                onChange={e => handleScoreFieldChange(reportStudentId, 'teacher_remark', e.target.value)}
                                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[80px]"
                                                placeholder={`Enter ${settings.class_teacher_label.toLowerCase()}'s comment...`}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">{settings.head_teacher_label} Remark</label>
                                            <textarea
                                                value={scores.find(s => s.student_id === reportStudentId && s.session === settings.current_session && s.term === settings.current_term)?.head_teacher_remark || ''}
                                                onChange={e => handleScoreFieldChange(reportStudentId, 'head_teacher_remark', e.target.value)}
                                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[80px]"
                                                placeholder={`Enter ${settings.head_teacher_label.toLowerCase()}'s comment...`}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </>
                        ) : (
                            <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-12 text-gray-400">
                                Select a student to set their behavior and skills ratings
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'report' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block">
                    <div className="lg:col-span-1 space-y-4 no-print">
                        <Card title="Selection">
                            <div className="space-y-4">
                                <Select label="Class" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setReportStudentId(''); }}>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                                <div className="space-y-1 max-h-[400px] overflow-y-auto border rounded-md">
                                    <button
                                        onClick={() => setReportStudentId('all')}
                                        className={`w-full text-left px-3 py-2 text-sm font-medium border-b flex justify-between ${reportStudentId === 'all' ? 'bg-brand-100 text-brand-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        📄 All Students ({activeStudents.length})
                                        <ChevronRight className="h-4 w-4 opacity-50" />
                                    </button>
                                    {activeStudents.map(s => (
                                        <button key={s.id} onClick={() => setReportStudentId(s.id)} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between ${reportStudentId === s.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'}`}>{s.names}<ChevronRight className="h-4 w-4 opacity-50" /></button>
                                    ))}
                                </div>
                                {reportStudentId && (
                                    <Button className="w-full mt-4 flex items-center justify-center gap-2" onClick={handlePrint}>
                                        <Printer className="h-4 w-4" />
                                        {reportStudentId === 'all' ? `Print All (${activeStudents.length} students)` : 'Print / Save as PDF'}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-3 print:w-full overflow-y-auto print:overflow-visible">
                        {reportStudentId === 'all' && currentClass ? (
                            // Print all students with page breaks
                            <div id="report-card" className="space-y-0">
                                {activeStudents.map((student, index) => {
                                    const studentScore = scores.find(s => s.student_id === student.id && s.session === settings.current_session && s.term === settings.current_term);
                                    if (studentScore) {
                                        studentScore.position = Utils.getStudentPosition(student.id, students, scores, settings.current_session, settings.current_term) || undefined;
                                    }
                                    return (
                                        <div key={student.id} className={index > 0 ? 'page-break-before' : ''}>
                                            <ReportCardTemplate
                                                student={student}
                                                currentClass={currentClass}
                                                score={studentScore || { id: '', student_id: student.id, class_id: selectedClass, session: settings.current_session, term: settings.current_term, rows: [], average: 0, created_at: Date.now(), updated_at: Date.now(), affective: {}, psychomotor: {} }}
                                                settings={settings}
                                                subjects={classSubjects}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : previewScore && selectedStudent && currentClass ? (
                            <div id="report-card" className="bg-white shadow-lg relative" style={{ fontFamily: settings?.report_font_family || 'inherit' }}>
                                {/* Watermark */}
                                {settings?.watermark_media && (
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                                        {settings?.tiled_watermark ? (
                                            <div 
                                                className="absolute opacity-[0.06]"
                                                style={{
                                                    backgroundImage: `url(${settings.watermark_media})`,
                                                    backgroundRepeat: 'repeat',
                                                    backgroundSize: '100px 100px',
                                                    width: '200%',
                                                    height: '200%',
                                                    top: '-50%',
                                                    left: '-50%',
                                                    transform: 'rotate(-30deg)',
                                                    filter: 'grayscale(50%) opacity(0.7)'
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
                                                <img src={settings.watermark_media} alt="" className="w-2/3 max-w-md object-contain" style={{ filter: 'grayscale(50%)' }} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content wrapper */}
                                <div className="relative z-10 p-8">
                                    {/* School Header - Clean centered design */}
                                    <div className="text-center mb-8">
                                        {settings?.logo_media && (
                                            <div className="flex justify-center mb-3">
                                                <img src={settings.logo_media} alt="Logo" className="h-20 w-20 object-contain" />
                                            </div>
                                        )}
                                        <h1 className="text-2xl md:text-3xl font-black text-blue-900 uppercase tracking-wide">
                                            {settings?.school_name || 'School Name'}
                                        </h1>
                                        <p className="text-gray-600 text-sm mt-1">{settings?.school_address}</p>
                                        {(settings?.school_email || settings?.school_phone) && (
                                            <p className="text-blue-600 text-xs mt-1">
                                                {settings?.school_email}{settings?.school_email && settings?.school_phone ? ' | ' : ''}{settings?.school_phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Student Info - Simple bordered table style */}
                                    <div className="border border-gray-300 rounded mb-6">
                                        <div className="grid grid-cols-2 divide-x divide-gray-300">
                                            <div className="p-3 border-b border-gray-300 flex">
                                                <span className="text-xs text-gray-500 uppercase w-32">Student Name:</span>
                                                <span className="font-bold text-gray-800">{selectedStudent.names}</span>
                                            </div>
                                            <div className="p-3 border-b border-gray-300 flex">
                                                <span className="text-xs text-gray-500 uppercase w-32">Admission No:</span>
                                                <span className="font-bold text-gray-800">{selectedStudent.student_no}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-gray-300">
                                            <div className="p-3 border-b border-gray-300 flex">
                                                <span className="text-xs text-gray-500 uppercase w-32">Class:</span>
                                                <span className="font-bold text-gray-800">{currentClass.name}</span>
                                            </div>
                                            <div className="p-3 border-b border-gray-300 flex">
                                                <span className="text-xs text-gray-500 uppercase w-32">Session / Term:</span>
                                                <span className="font-bold text-blue-700">{settings.current_session} | {settings.current_term}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-gray-300">
                                            <div className="p-3 flex">
                                                <span className="text-xs text-gray-500 uppercase w-32">Attendance:</span>
                                                <span className="font-bold text-gray-800">{previewScore.attendance_present || 0} / {previewScore.attendance_total || 0}</span>
                                            </div>
                                            <div className="p-3 flex">
                                                <span className="text-xs text-gray-500 uppercase w-32">Next Term Resumes:</span>
                                                <span className="font-bold text-blue-700">{settings?.next_term_begins || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Academic Performance Table - Clean design */}
                                    <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="border border-gray-300 p-3 text-left text-gray-700 font-bold">Subject</th>
                                                <th className="border border-gray-300 p-3 text-center text-gray-700 font-bold w-16">HW/CW</th>
                                                <th className="border border-gray-300 p-3 text-center text-gray-700 font-bold w-16">CAT</th>
                                                <th className="border border-gray-300 p-3 text-center text-gray-700 font-bold w-16">Exam</th>
                                                <th className="border border-gray-300 p-3 text-center text-gray-700 font-bold w-16">Total</th>
                                                <th className="border border-gray-300 p-3 text-center text-gray-700 font-bold w-14">Grade</th>
                                                <th className="border border-gray-300 p-3 text-left text-gray-700 font-bold">Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classSubjects.map((subj) => {
                                                const row = previewScore.rows?.find(r => r.subject === subj) || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', comment: '-' };
                                                const gradeColor = row.grade === 'A' ? 'text-green-600' : row.grade === 'B' ? 'text-blue-600' : row.grade === 'C' ? 'text-amber-600' : row.grade === 'D' ? 'text-orange-500' : row.grade === 'F' ? 'text-red-500' : 'text-gray-400';
                                                return (
                                                    <tr key={subj} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 p-3 font-medium text-gray-800">{subj}</td>
                                                        <td className="border border-gray-300 p-3 text-center text-gray-600">{row.ca1 || '-'}</td>
                                                        <td className="border border-gray-300 p-3 text-center text-gray-600">{row.ca2 || '-'}</td>
                                                        <td className="border border-gray-300 p-3 text-center text-gray-600">{row.exam || '-'}</td>
                                                        <td className="border border-gray-300 p-3 text-center font-bold text-gray-900">{row.total || '-'}</td>
                                                        <td className={`border border-gray-300 p-3 text-center font-bold ${gradeColor}`}>{row.grade}</td>
                                                        <td className="border border-gray-300 p-3 text-xs text-gray-500 italic">{row.comment || '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Summary Row */}
                                    <div className="flex justify-end gap-6 mb-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 uppercase text-xs font-bold">Total Score:</span>
                                            <span className="font-black text-lg text-gray-800">{previewScore.total_score || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 uppercase text-xs font-bold">Average:</span>
                                            <span className="font-black text-lg text-blue-700">{(previewScore.average || 0).toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    {/* Skills & Behavior - Side by Side */}
                                    {settings?.show_skills && (
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            <div className="border border-gray-300 rounded">
                                                <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                                                    <h3 className="text-xs font-bold text-gray-700 uppercase">Affective Domain</h3>
                                                </div>
                                                <table className="w-full text-xs">
                                                    <tbody>
                                                        {Utils.DOMAINS_AFFECTIVE.map((trait, idx) => (
                                                            <tr key={trait} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="p-2 text-gray-700 border-b border-gray-200">{trait}</td>
                                                                <td className="p-2 text-center font-bold text-gray-800 w-10 border-b border-gray-200">{previewScore.affective?.[trait] || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="border border-gray-300 rounded">
                                                <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
                                                    <h3 className="text-xs font-bold text-gray-700 uppercase">Psychomotor Skills</h3>
                                                </div>
                                                <table className="w-full text-xs">
                                                    <tbody>
                                                        {Utils.DOMAINS_PSYCHOMOTOR.map((skill, idx) => (
                                                            <tr key={skill} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="p-2 text-gray-700 border-b border-gray-200">{skill}</td>
                                                                <td className="p-2 text-center font-bold text-gray-800 w-10 border-b border-gray-200">{previewScore.psychomotor?.[skill] || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarks Section - Simple bordered */}
                                    <div className="border border-gray-300 rounded mb-6">
                                        <div className="p-3 border-b border-gray-300">
                                            <span className="text-xs font-bold text-gray-500 uppercase">{settings?.class_teacher_label || 'Class Teacher'}&apos;s Remark:</span>
                                            <p className="text-sm text-gray-700 mt-1">{previewScore.teacher_remark || 'No comment provided.'}</p>
                                        </div>
                                        <div className="p-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase">{settings?.head_teacher_label || 'Head Teacher'}&apos;s Remark:</span>
                                            <p className="text-sm text-gray-700 mt-1">{previewScore.head_teacher_remark || 'No comment provided.'}</p>
                                        </div>
                                    </div>

                                    {/* Signatures */}
                                    <div className="grid grid-cols-2 gap-12 pt-4">
                                        <div className="text-center">
                                            <div className="h-12 border-b border-gray-400 mb-2"></div>
                                            <p className="text-xs font-bold text-gray-600 uppercase">{settings?.class_teacher_label || 'Class Teacher'}&apos;s Signature</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="h-12 border-b border-gray-400 mb-2 flex items-end justify-center">
                                                {settings?.head_of_school_signature && (
                                                    <img src={settings.head_of_school_signature} className="h-10 object-contain" alt="Signature" />
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-gray-600 uppercase">{settings?.head_teacher_label || 'Head Teacher'}&apos;s Signature</p>
                                        </div>
                                    </div>

                                    {/* Tagline */}
                                    {settings?.school_tagline && (
                                        <div className="mt-8 text-center border-t border-gray-200 pt-4">
                                            <p className="text-xs text-gray-500 italic">&quot;{settings.school_tagline}&quot;</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-12 text-gray-400">
                                Select a student or &quot;All Students&quot; to preview report cards
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
