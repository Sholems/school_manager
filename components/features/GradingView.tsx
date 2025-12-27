import React, { useState, useEffect } from 'react';
import { ChevronRight, Save, Printer } from 'lucide-react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const ScoreInput = ({ value, max, onChange, className }: { value: number, max: number, onChange: (val: number) => void, className?: string }) => (
    <input type="number" min="0" max={max} value={value || ''} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v <= max) onChange(v); if (e.target.value === '') onChange(0); }} className={`w-16 h-8 text-center border rounded focus:ring-2 focus:ring-brand-500 focus:outline-none ${className}`} />
);

interface GradingViewProps {
    students: Types.Student[];
    classes: Types.Class[];
    scores: Types.Score[];
    settings: Types.Settings;
    onSaveScores: (scores: Types.Score[]) => void;
}

export const GradingView: React.FC<GradingViewProps> = ({
    students, classes, scores, settings, onSaveScores
}) => {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
    const currentClass = classes.find(c => c.id === selectedClass);
    const classSubjects = Utils.getSubjectsForClass(currentClass);
    const [selectedSubject, setSelectedSubject] = useState(classSubjects[0] || '');
    const [activeTab, setActiveTab] = useState<'broadsheet' | 'report' | 'skills'>('broadsheet');
    const [reportStudentId, setReportStudentId] = useState('');
    const [previewScore, setPreviewScore] = useState<Types.Score | null>(null);

    const activeStudents = students.filter(s => s.class_id === selectedClass);

    useEffect(() => {
        if (classSubjects.length > 0 && !classSubjects.includes(selectedSubject)) {
            setSelectedSubject(classSubjects[0]);
        }
    }, [selectedClass, classSubjects, selectedSubject]);

    const handleScoreChange = (studentId: string, field: 'ca1' | 'ca2' | 'exam', value: number) => {
        const newScores = [...scores];
        let score = newScores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);

        if (!score) {
            score = {
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
            newScores.push(score);
        }

        let rowIndex = score.rows.findIndex(r => r.subject === selectedSubject);
        if (rowIndex === -1) {
            score.rows.push({ subject: selectedSubject, ca1: 0, ca2: 0, exam: 0, total: 0, grade: 'F', comment: '' });
            rowIndex = score.rows.length - 1;
        }
        const row = score.rows[rowIndex];
        (row as any)[field] = value;
        row.total = row.ca1 + row.ca2 + row.exam;
        const { grade, comment } = Utils.calculateGrade(row.total);
        row.grade = grade;
        row.comment = comment;
        const totalScore = score.rows.reduce((acc, r) => acc + r.total, 0);
        score.average = totalScore / score.rows.length;
        score.total_score = totalScore;
        onSaveScores(newScores);
    };

    const handleTraitChange = (studentId: string, category: 'affective' | 'psychomotor', trait: string, value: number) => {
        const newScores = [...scores];
        let score = newScores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);

        if (!score) {
            score = {
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
            newScores.push(score);
        }

        if (!score[category]) score[category] = {};
        score[category][trait] = value;
        onSaveScores(newScores);
    };

    const handleScoreFieldChange = (studentId: string, field: keyof Types.Score, value: any) => {
        const newScores = [...scores];
        let score = newScores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);

        if (!score) {
            score = {
                id: Utils.generateId(), student_id: studentId, class_id: selectedClass, session: settings.current_session, term: settings.current_term,
                rows: [], average: 0, created_at: Date.now(), updated_at: Date.now(), affective: {}, psychomotor: {}
            };
            newScores.push(score);
        }

        (score as any)[field] = value;
        onSaveScores(newScores);
    };

    const getRow = (studentId: string) => {
        const score = scores.find(s => s.student_id === studentId && s.session === settings.current_session && s.term === settings.current_term);
        return score?.rows.find(r => r.subject === selectedSubject) || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', comment: '-' };
    };

    const generateReport = () => {
        if (!reportStudentId) return;
        const score = scores.find(s => s.student_id === reportStudentId && s.session === settings.current_session && s.term === settings.current_term);
        if (score) {
            score.position = Utils.getStudentPosition(reportStudentId, students, scores, settings.current_session, settings.current_term) || undefined;
        }
        setPreviewScore(score ? { ...score } : null);
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => { generateReport(); }, [reportStudentId, scores, settings]);

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
                                    {activeStudents.map(s => (
                                        <button key={s.id} onClick={() => setReportStudentId(s.id)} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between ${reportStudentId === s.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'}`}>{s.names}<ChevronRight className="h-4 w-4 opacity-50" /></button>
                                    ))}
                                </div>
                                {reportStudentId && (
                                    <Button className="w-full mt-4 flex items-center justify-center gap-2" onClick={handlePrint}>
                                        <Printer className="h-4 w-4" />
                                        Print / Save as PDF
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-3 print:w-full">
                        {previewScore && reportStudentId ? (
                            <div
                                className="bg-white border shadow-lg p-8 print:shadow-none print:border-none print:w-full relative overflow-hidden transition-transform duration-300"
                                id="report-card"
                                style={{
                                    fontFamily: settings.report_font_family,
                                    transform: settings.report_scale < 100 ? `scale(${settings.report_scale / 100})` : 'none',
                                    transformOrigin: 'top center'
                                }}
                            >
                                {settings.watermark_media && (
                                    <div className={`absolute inset-0 pointer-events-none ${settings.tiled_watermark ? 'opacity-[0.03]' : 'flex items-center justify-center opacity-[0.05]'}`}>
                                        {settings.tiled_watermark ? (
                                            <div
                                                className="absolute inset-[-50%] rotate-[-30deg]"
                                                style={{
                                                    backgroundImage: `url(${settings.watermark_media})`,
                                                    backgroundSize: '120px',
                                                    backgroundRepeat: 'repeat'
                                                }}
                                            ></div>
                                        ) : (
                                            <img src={settings.watermark_media} alt="Watermark" className="w-1/2 object-contain" />
                                        )}
                                    </div>
                                )}

                                <div className="relative z-10">
                                    <div className="flex flex-col items-center text-center mb-6">
                                        {settings.logo_media && (
                                            <div className="h-24 w-24 mb-4">
                                                <img src={settings.logo_media} alt="School Logo" className="h-full w-full object-contain" />
                                            </div>
                                        )}
                                        <h1 className="text-4xl font-black text-brand-900 uppercase tracking-tighter leading-none mb-2">{settings.school_name}</h1>
                                        <p className="text-gray-600 font-medium text-lg">{settings.school_address}</p>
                                        <p className="text-gray-500 text-sm mt-1 font-mono">{settings.school_email} | {settings.school_phone}</p>
                                        <div className="w-full h-1 bg-green-600 mt-6 rounded-full"></div>
                                    </div>

                                    {/* Student Details Section */}
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-8 bg-gray-50/50 p-4 border rounded-xl border-gray-100">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Student Name:</span>
                                            <span className="text-sm font-black text-gray-900">{students.find(s => s.id === reportStudentId)?.names}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Admission No:</span>
                                            <span className="text-sm font-black text-gray-900">{students.find(s => s.id === reportStudentId)?.student_no}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Class:</span>
                                            <span className="text-sm font-black text-gray-900">{classes.find(c => c.id === selectedClass)?.name}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Session / Term:</span>
                                            <span className="text-sm font-black text-gray-900">{settings.current_session} | {settings.current_term}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Attendance:</span>
                                            <span className="text-sm font-black text-gray-900">{previewScore.attendance_present || 0} / {previewScore.attendance_total || 0}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Next Term Resumes:</span>
                                            <span className="text-sm font-black text-brand-600">{settings.next_term_begins || 'TBA'}</span>
                                        </div>
                                    </div>

                                    <table className="w-full border-collapse border border-gray-300 text-sm mb-8">
                                        <thead className="bg-brand-50 text-brand-900">
                                            <tr>
                                                <th className="border border-gray-300 p-2 text-left">Subject</th>
                                                <th className="border border-gray-300 p-2 text-center w-20">HW/CW</th>
                                                <th className="border border-gray-300 p-2 text-center w-20">CAT</th>
                                                <th className="border border-gray-300 p-2 text-center w-20">Exam</th>
                                                <th className="border border-gray-300 p-2 text-center w-20">Total</th>
                                                <th className="border border-gray-300 p-2 text-center w-16">Grade</th>
                                                <th className="border border-gray-300 p-2 text-left">Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classSubjects.map(subj => {
                                                const row = previewScore.rows.find(r => r.subject === subj) || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', comment: '-' };
                                                return (
                                                    <tr key={subj}>
                                                        <td className="border border-gray-300 p-2 font-medium">{subj}</td>
                                                        <td className="border border-gray-300 p-2 text-center">{row.ca1 || '-'}</td>
                                                        <td className="border border-gray-300 p-2 text-center">{row.ca2 || '-'}</td>
                                                        <td className="border border-gray-300 p-2 text-center font-medium">{row.exam || '-'}</td>
                                                        <td className="border border-gray-300 p-2 text-center font-bold bg-gray-50">{row.total || '-'}</td>
                                                        <td className={`border border-gray-300 p-2 text-center font-bold ${row.grade === 'F' ? 'text-red-600' : 'text-brand-700'}`}>{row.grade}</td>
                                                        <td className="border border-gray-300 p-2 text-xs italic text-gray-500">{row.comment}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Academic Summary on Page 1 */}
                                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border mb-8">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Total Score</p>
                                            <p className="text-xl font-bold text-gray-900">{previewScore.total_score || '-'}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Average</p>
                                            <p className="text-xl font-bold text-gray-900">{(previewScore.average || 0).toFixed(1)}%</p>
                                        </div>
                                        {settings.show_position && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase font-bold">Position</p>
                                                <p className="text-xl font-bold text-brand-600">{previewScore.position ? Utils.ordinalSuffix(previewScore.position) : '-'}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Page Break */}
                                    <div className="page-break"></div>

                                    {/* Page 2 Header (Minimal) */}
                                    <div className="mb-6 pt-4 border-t-2 border-brand-900 flex justify-between items-end print:pt-0 print:mt-0">
                                        <div>
                                            <h2 className="text-2xl font-black text-brand-900 uppercase">{settings.school_name}</h2>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Supplemental Report: {students.find(s => s.id === reportStudentId)?.names}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400">{settings.current_session} | {settings.current_term}</p>
                                        </div>
                                    </div>

                                    {settings.show_skills && (
                                        <div className="grid grid-cols-2 gap-8 mb-8">
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-bold text-brand-900 border-b border-brand-200 pb-1 mb-2 uppercase">Affective Domain</h3>
                                                <table className="w-full text-xs border-collapse">
                                                    <tbody>
                                                        {Utils.DOMAINS_AFFECTIVE.map(trait => (
                                                            <tr key={trait}>
                                                                <td className="border py-1 px-2 text-gray-700">{trait}</td>
                                                                <td className="border py-1 px-2 text-center font-bold w-8">{previewScore.affective?.[trait] || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-bold text-brand-900 border-b border-brand-200 pb-1 mb-2 uppercase">Psychomotor Skills</h3>
                                                <table className="w-full text-xs border-collapse">
                                                    <tbody>
                                                        {Utils.DOMAINS_PSYCHOMOTOR.map(skill => (
                                                            <tr key={skill}>
                                                                <td className="border py-1 px-2 text-gray-700">{skill}</td>
                                                                <td className="border py-1 px-2 text-center font-bold w-8">{previewScore.psychomotor?.[skill] || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Remarks Section */}
                                    <div className="space-y-4 mb-8">
                                        <div className="border-l-4 border-brand-500 pl-4 py-1 bg-brand-50/20 rounded-r-lg">
                                            <h4 className="text-[10px] font-black text-brand-900 uppercase">{(settings.class_teacher_label || '').toUpperCase()}'S REMARK:</h4>
                                            <p className="text-sm italic text-gray-700">{previewScore.teacher_remark || 'No comment provided.'}</p>
                                        </div>
                                        <div className="border-l-4 border-brand-500 pl-4 py-1 bg-brand-50/20 rounded-r-lg">
                                            <h4 className="text-[10px] font-black text-brand-900 uppercase">{(settings.head_teacher_label || '').toUpperCase()}'S REMARK:</h4>
                                            <p className="text-sm italic text-gray-700">{previewScore.head_teacher_remark || 'No comment provided.'}</p>
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-dashed border-gray-300">
                                        <div className="text-center">
                                            <div className="h-16 border-b border-gray-400 mb-2 flex items-end justify-center">
                                                {/* Optionally show class teacher's signature if uniquely stored */}
                                            </div>
                                            <p className="text-xs font-bold uppercase">{settings.class_teacher_label || 'Class Teacher'} Signature</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="h-16 border-b border-gray-400 mb-2 flex items-end justify-center">
                                                {settings.head_of_school_signature && <img src={settings.head_of_school_signature} className="h-12 object-contain" />}
                                            </div>
                                            <p className="text-xs font-bold uppercase">{settings.head_teacher_label || 'Head Teacher'} Signature</p>
                                        </div>
                                    </div>

                                    {settings.school_tagline && (
                                        <div className="mt-12 text-center">
                                            <div className="w-16 h-1 bg-brand-500 mx-auto mb-4 rounded-full opacity-20"></div>
                                            <p className="text-sm font-medium text-gray-500 italic">"{settings.school_tagline}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-12 text-gray-400">
                                Select a student to preview their report card
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
