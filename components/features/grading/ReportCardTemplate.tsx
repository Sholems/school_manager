import React from 'react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface ReportCardTemplateProps {
    student: Types.Student;
    currentClass: Types.Class;
    score: Types.Score;
    settings: Types.Settings;
    subjects: string[];
}

export const ReportCardTemplate: React.FC<ReportCardTemplateProps> = ({
    student,
    currentClass,
    score,
    settings,
    subjects
}) => {
    console.log('ReportCardTemplate: student:', student?.names, 'score:', score, 'subjects:', subjects);

    const commonStyles = {
        fontFamily: settings.report_font_family,
    };

    const WatermarkLayer = () => (
        settings.watermark_media ? (
            <div className={`absolute inset-0 pointer-events-none ${settings.tiled_watermark ? 'opacity-[0.03]' : 'flex items-center justify-center opacity-[0.05]'}`}>
                {settings.tiled_watermark ? (
                    <div
                        className="absolute inset-[-50%] rotate-[-30deg]"
                        style={{
                            backgroundImage: `url(${settings.watermark_media})`,
                            backgroundSize: '120px',
                            backgroundRepeat: 'repeat'
                        }}
                    />
                ) : (
                    <img src={settings.watermark_media} alt="Watermark" className="w-1/2 object-contain" />
                )}
            </div>
        ) : null
    );

    const scale = settings.report_scale || 100; // Prevent 0/null from hiding content
    console.log('ReportCardTemplate: scale:', scale, 'settings.report_scale:', settings.report_scale);

    return (
        <div
            id="report-card"
            style={{
                ...commonStyles,
                transform: scale < 100 ? `scale(${scale / 100})` : 'none',
                transformOrigin: 'top center'
            }}
        >
            {/* ========== PAGE 1: Academic Report ========== */}
            <div
                className="report-page bg-white border shadow-lg p-8 print:shadow-none print:border-none print:p-[10mm] relative"
                style={{ minHeight: 'auto' }}
            >
                <WatermarkLayer />

                <div className="relative z-10">
                    {/* School Header */}
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

                    {/* Student Details */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-8 bg-gray-50/50 p-4 border rounded-xl border-gray-100">
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Student Name:</span>
                            <span className="text-sm font-black text-gray-900">{student.names}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Admission No:</span>
                            <span className="text-sm font-black text-gray-900">{student.student_no}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Class:</span>
                            <span className="text-sm font-black text-gray-900">{currentClass.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Session / Term:</span>
                            <span className="text-sm font-black text-gray-900">{settings.current_session} | {settings.current_term}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Attendance:</span>
                            <span className="text-sm font-black text-gray-900">{score.attendance_present || 0} / {score.attendance_total || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Next Term Resumes:</span>
                            <span className="text-sm font-black text-brand-600">{settings.next_term_begins || 'TBA'}</span>
                        </div>
                    </div>

                    {/* Scores Table */}
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
                            {subjects.map(subj => {
                                const row = score.rows.find(r => r.subject === subj) || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', comment: '-' };
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

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Score</p>
                            <p className="text-xl font-bold text-gray-900">{score.total_score || '-'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Average</p>
                            <p className="text-xl font-bold text-gray-900">{(score.average || 0).toFixed(1)}%</p>
                        </div>
                        {settings.show_position && (
                            <div className="text-center">
                                <p className="text-xs text-gray-500 uppercase font-bold">Position</p>
                                <p className="text-xl font-bold text-brand-600">{score.position ? Utils.ordinalSuffix(score.position) : '-'}</p>
                            </div>
                        )}
                    </div>

                    {/* Skills & Behavior */}
                    {settings.show_skills && (
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-brand-900 border-b border-brand-200 pb-1 mb-2 uppercase">Affective Domain</h3>
                                <table className="w-full text-xs border-collapse">
                                    <tbody>
                                        {Utils.DOMAINS_AFFECTIVE.map(trait => (
                                            <tr key={trait}>
                                                <td className="border py-1 px-2 text-gray-700">{trait}</td>
                                                <td className="border py-1 px-2 text-center font-bold w-8">{score.affective?.[trait] || '-'}</td>
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
                                                <td className="border py-1 px-2 text-center font-bold w-8">{score.psychomotor?.[skill] || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    <div className="space-y-4 mb-8 mt-8">
                        <div className="border-l-4 border-brand-500 pl-4 py-1 bg-brand-50/20 rounded-r-lg">
                            <h4 className="text-[10px] font-black text-brand-900 uppercase">{(settings.class_teacher_label || '').toUpperCase()}'S REMARK:</h4>
                            <p className="text-sm italic text-gray-700">{score.teacher_remark || 'No comment provided.'}</p>
                        </div>
                        <div className="border-l-4 border-brand-500 pl-4 py-1 bg-brand-50/20 rounded-r-lg">
                            <h4 className="text-[10px] font-black text-brand-900 uppercase">{(settings.head_teacher_label || '').toUpperCase()}'S REMARK:</h4>
                            <p className="text-sm italic text-gray-700">{score.head_teacher_remark || 'No comment provided.'}</p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-dashed border-gray-300">
                        <div className="text-center">
                            <div className="h-16 border-b border-gray-400 mb-2 flex items-end justify-center">
                                {/* Class teacher signature placeholder */}
                            </div>
                            <p className="text-xs font-bold uppercase">{settings.class_teacher_label || 'Class Teacher'} Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16 border-b border-gray-400 mb-2 flex items-end justify-center">
                                {settings.head_of_school_signature && <img src={settings.head_of_school_signature} className="h-12 object-contain" alt="Head Teacher Signature" />}
                            </div>
                            <p className="text-xs font-bold uppercase">{settings.head_teacher_label || 'Head Teacher'} Signature</p>
                        </div>
                    </div>

                    {/* Tagline */}
                    {settings.school_tagline && (
                        <div className="mt-12 text-center">
                            <div className="w-16 h-1 bg-brand-500 mx-auto mb-4 rounded-full opacity-20"></div>
                            <p className="text-sm font-medium text-gray-500 italic">"{settings.school_tagline}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
