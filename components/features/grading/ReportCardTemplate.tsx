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

// Grading key for the report card
const GRADING_KEY = [
    { grade: 'A', range: '75-100', remark: 'Excellent' },
    { grade: 'B', range: '65-74', remark: 'Very Good' },
    { grade: 'C', range: '50-64', remark: 'Good' },
    { grade: 'D', range: '40-49', remark: 'Fair' },
    { grade: 'F', range: '0-39', remark: 'Fail' },
];

// Rating key for skills
const RATING_KEY = [
    { rating: 5, meaning: 'Outstanding' },
    { rating: 4, meaning: 'Very Good' },
    { rating: 3, meaning: 'Good' },
    { rating: 2, meaning: 'Fair' },
    { rating: 1, meaning: 'Poor' },
];

// Helper to get grade color
const getGradeColor = (grade: string) => {
    switch (grade) {
        case 'A': return 'text-emerald-600 bg-emerald-50';
        case 'B': return 'text-blue-600 bg-blue-50';
        case 'C': return 'text-amber-600 bg-amber-50';
        case 'D': return 'text-orange-600 bg-orange-50';
        case 'F': return 'text-red-600 bg-red-50';
        default: return 'text-gray-600 bg-gray-50';
    }
};

// Helper to render rating dots
const RatingDots = ({ rating }: { rating: number }) => {
    return (
        <div className="flex gap-0.5 justify-center">
            {[1, 2, 3, 4, 5].map((dot) => (
                <div
                    key={dot}
                    className={`w-3 h-3 rounded-full border ${
                        dot <= rating 
                            ? 'bg-brand-600 border-brand-600' 
                            : 'bg-white border-gray-300'
                    }`}
                />
            ))}
        </div>
    );
};

export const ReportCardTemplate: React.FC<ReportCardTemplateProps> = ({
    student,
    currentClass,
    score,
    settings,
    subjects
}) => {
    // Calculate class average and highest score if available
    const attendancePercent = score?.attendance_total 
        ? Math.round((score.attendance_present || 0) / score.attendance_total * 100) 
        : null;

    return (
        <div 
            id="report-card" 
            className="bg-white shadow-2xl max-w-4xl mx-auto"
            style={{ fontFamily: settings?.report_font_family || 'inherit' }}
        >
            {/* Decorative Header Border */}
            <div className="h-2 bg-gradient-to-r from-brand-700 via-brand-500 to-emerald-500" />
            
            {/* School Header */}
            <div className="relative px-8 pt-6 pb-4">
                {/* Watermark Background */}
                {settings?.watermark_media && settings?.tiled_watermark && (
                    <div 
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: `url(${settings.watermark_media})`,
                            backgroundSize: '120px',
                            backgroundRepeat: 'repeat',
                        }}
                    />
                )}
                
                <div className="flex items-center justify-between relative">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {settings?.logo_media && (
                            <div className="h-24 w-24 rounded-full border-4 border-brand-100 shadow-lg overflow-hidden bg-white p-1">
                                <img 
                                    src={settings.logo_media} 
                                    alt="School Logo" 
                                    className="h-full w-full object-contain" 
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* School Info - Center */}
                    <div className="flex-1 text-center px-6">
                        <h1 className="text-2xl font-black text-brand-800 uppercase tracking-wide">
                            {settings?.school_name || 'School Name'}
                        </h1>
                        {settings?.school_tagline && (
                            <p className="text-sm italic text-brand-600 mt-0.5">
                                "{settings.school_tagline}"
                            </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1">
                            {settings?.school_address}
                        </p>
                        <p className="text-xs text-gray-500">
                            {settings?.school_phone} • {settings?.school_email}
                        </p>
                        <div className="mt-3 inline-block px-6 py-1.5 bg-brand-800 text-white text-sm font-bold uppercase tracking-widest rounded-full shadow">
                            Student Report Card
                        </div>
                    </div>
                    
                    {/* Director's Photo/Placeholder */}
                    <div className="flex-shrink-0">
                        {settings?.director_signature ? (
                            <div className="h-24 w-24 rounded-full border-4 border-gray-100 shadow-lg overflow-hidden bg-gray-50">
                                <img 
                                    src={settings.director_signature} 
                                    alt="Director" 
                                    className="h-full w-full object-cover" 
                                />
                            </div>
                        ) : (
                            <div className="h-24 w-24 rounded-full border-4 border-gray-100 shadow-inner bg-gradient-to-br from-gray-50 to-gray-100" />
                        )}
                    </div>
                </div>
            </div>

            {/* Elegant Divider */}
            <div className="px-8">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-200 to-brand-400" />
                    <div className="w-2 h-2 rotate-45 bg-brand-500" />
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-brand-200 to-brand-400" />
                </div>
            </div>

            {/* Student Information Card */}
            <div className="px-8 py-4">
                <div className="grid grid-cols-4 gap-3">
                    {/* Student Photo & Name */}
                    <div className="col-span-1 flex flex-col items-center">
                        <div className="h-28 w-24 rounded-lg border-2 border-brand-200 shadow-md overflow-hidden bg-gray-50">
                            {student?.passport_url ? (
                                <img 
                                    src={student.passport_url} 
                                    alt={student.names} 
                                    className="h-full w-full object-cover" 
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
                                    <span className="text-3xl font-bold text-brand-400">
                                        {student?.names?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Student Details Grid */}
                    <div className="col-span-3 grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Student Name</span>
                            <p className="font-bold text-gray-900">{student?.names}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Admission No.</span>
                            <p className="font-bold text-gray-900">{student?.student_no}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Class</span>
                            <p className="font-bold text-gray-900">{currentClass?.name}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Gender</span>
                            <p className="font-bold text-gray-900 capitalize">{student?.gender || '-'}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Session</span>
                            <p className="font-bold text-brand-700">{settings?.current_session}</p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Term</span>
                            <p className="font-bold text-brand-700">{settings?.current_term}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Performance Section */}
            <div className="px-8 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-1.5 bg-brand-600 rounded-full" />
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Academic Performance</h2>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-brand-700 to-brand-600 text-white">
                                <th className="py-2.5 px-3 text-left font-semibold text-xs uppercase tracking-wider">Subject</th>
                                <th className="py-2.5 px-2 text-center font-semibold text-xs uppercase tracking-wider w-16">HW/CW<br/><span className="font-normal text-brand-200">(20)</span></th>
                                <th className="py-2.5 px-2 text-center font-semibold text-xs uppercase tracking-wider w-16">CAT<br/><span className="font-normal text-brand-200">(20)</span></th>
                                <th className="py-2.5 px-2 text-center font-semibold text-xs uppercase tracking-wider w-16">Exam<br/><span className="font-normal text-brand-200">(60)</span></th>
                                <th className="py-2.5 px-2 text-center font-semibold text-xs uppercase tracking-wider w-16 bg-brand-800">Total<br/><span className="font-normal text-brand-200">(100)</span></th>
                                <th className="py-2.5 px-2 text-center font-semibold text-xs uppercase tracking-wider w-14">Grade</th>
                                <th className="py-2.5 px-3 text-left font-semibold text-xs uppercase tracking-wider">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subjects?.map((subj, idx) => {
                                const row = score?.rows?.find(r => r.subject === subj) || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: '-', comment: '-' };
                                const gradeColors = getGradeColor(row.grade);
                                return (
                                    <tr key={subj} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <td className="py-2 px-3 font-medium text-gray-800">{subj}</td>
                                        <td className="py-2 px-2 text-center text-gray-700">{row.ca1 || '-'}</td>
                                        <td className="py-2 px-2 text-center text-gray-700">{row.ca2 || '-'}</td>
                                        <td className="py-2 px-2 text-center text-gray-700">{row.exam || '-'}</td>
                                        <td className="py-2 px-2 text-center font-bold text-gray-900 bg-gray-100/50">{row.total || '-'}</td>
                                        <td className="py-2 px-2 text-center">
                                            <span className={`inline-block w-7 h-7 leading-7 rounded-full font-bold text-xs ${gradeColors}`}>
                                                {row.grade}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-xs text-gray-500 italic">{row.comment}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Summary Cards */}
            <div className="px-8 py-4">
                <div className="grid grid-cols-5 gap-3">
                    <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl p-3 text-center border border-brand-200 shadow-sm">
                        <p className="text-[10px] uppercase tracking-wider text-brand-600 font-semibold mb-1">Total Score</p>
                        <p className="text-2xl font-black text-brand-800">{score?.total_score || '-'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center border border-emerald-200 shadow-sm">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">Average</p>
                        <p className="text-2xl font-black text-emerald-700">{(score?.average || 0).toFixed(1)}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center border border-amber-200 shadow-sm">
                        <p className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold mb-1">Position</p>
                        <p className="text-2xl font-black text-amber-700">{score?.position ? Utils.ordinalSuffix(score.position) : '-'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200 shadow-sm">
                        <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold mb-1">Subjects</p>
                        <p className="text-2xl font-black text-blue-700">{subjects?.length || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center border border-purple-200 shadow-sm">
                        <p className="text-[10px] uppercase tracking-wider text-purple-600 font-semibold mb-1">Attendance</p>
                        <p className="text-2xl font-black text-purple-700">
                            {attendancePercent !== null ? `${attendancePercent}%` : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Skills Assessment */}
            {settings?.show_skills && (
                <div className="px-8 py-4">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Affective Domain */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Affective Domain</h3>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50/50 to-white rounded-lg border border-emerald-100 overflow-hidden">
                                <table className="w-full text-xs">
                                    <tbody className="divide-y divide-emerald-100">
                                        {Utils.DOMAINS_AFFECTIVE.map((trait, idx) => (
                                            <tr key={trait} className={idx % 2 === 0 ? 'bg-white/50' : 'bg-emerald-50/30'}>
                                                <td className="py-1.5 px-3 text-gray-700">{trait}</td>
                                                <td className="py-1.5 px-3 w-24">
                                                    <RatingDots rating={score?.affective?.[trait] || 0} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Psychomotor Skills */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-5 w-1 bg-blue-500 rounded-full" />
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Psychomotor Skills</h3>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-lg border border-blue-100 overflow-hidden">
                                <table className="w-full text-xs">
                                    <tbody className="divide-y divide-blue-100">
                                        {Utils.DOMAINS_PSYCHOMOTOR.map((skill, idx) => (
                                            <tr key={skill} className={idx % 2 === 0 ? 'bg-white/50' : 'bg-blue-50/30'}>
                                                <td className="py-1.5 px-3 text-gray-700">{skill}</td>
                                                <td className="py-1.5 px-3 w-24">
                                                    <RatingDots rating={score?.psychomotor?.[skill] || 0} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Keys Section */}
            <div className="px-8 py-3">
                <div className="grid grid-cols-2 gap-6">
                    {/* Grading Key */}
                    <div className="flex items-center gap-4 text-[10px]">
                        <span className="font-bold text-gray-500 uppercase">Grading Key:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            {GRADING_KEY.map(({ grade, range, remark }) => (
                                <div key={grade} className="flex items-center gap-1">
                                    <span className={`inline-block w-4 h-4 leading-4 rounded text-center font-bold ${getGradeColor(grade)}`}>
                                        {grade}
                                    </span>
                                    <span className="text-gray-500">({range})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Rating Key */}
                    <div className="flex items-center gap-4 text-[10px]">
                        <span className="font-bold text-gray-500 uppercase">Rating Key:</span>
                        <div className="flex items-center gap-3">
                            {RATING_KEY.map(({ rating, meaning }) => (
                                <div key={rating} className="flex items-center gap-1">
                                    <span className="font-bold text-gray-700">{rating}</span>
                                    <span className="text-gray-400">=</span>
                                    <span className="text-gray-500">{meaning}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Remarks Section */}
            <div className="px-8 py-4">
                <div className="space-y-3">
                    {/* Class Teacher Remark */}
                    <div className="relative bg-gradient-to-r from-brand-50 to-white rounded-lg border border-brand-100 p-4 pl-5">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500 rounded-l-lg" />
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider text-brand-600 font-bold mb-1">
                                    {settings?.class_teacher_label || 'Class Teacher'}'s Remark
                                </p>
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                    "{score?.teacher_remark || 'No remark provided.'}"
                                </p>
                            </div>
                            <div className="text-center ml-4 flex-shrink-0">
                                <div className="h-12 w-24 border-b-2 border-gray-300 mb-1" />
                                <p className="text-[9px] uppercase tracking-wider text-gray-400">Signature</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Head Teacher Remark */}
                    <div className="relative bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-100 p-4 pl-5">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-lg" />
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">
                                    {settings?.head_teacher_label || 'Head of School'}'s Remark
                                </p>
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                    "{score?.head_teacher_remark || 'No remark provided.'}"
                                </p>
                            </div>
                            <div className="text-center ml-4 flex-shrink-0">
                                <div className="h-12 w-24 border-b-2 border-gray-300 mb-1 flex items-end justify-center">
                                    {settings?.head_of_school_signature && (
                                        <img 
                                            src={settings.head_of_school_signature} 
                                            className="h-10 object-contain" 
                                            alt="Signature" 
                                        />
                                    )}
                                </div>
                                <p className="text-[9px] uppercase tracking-wider text-gray-400">Signature & Stamp</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Term Info */}
            <div className="px-8 py-3">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-6 text-sm">
                        {settings?.next_term_begins && (
                            <div>
                                <span className="text-gray-500 text-xs">Next Term Begins:</span>
                                <span className="ml-2 font-bold text-gray-800">
                                    {new Date(settings.next_term_begins).toLocaleDateString('en-NG', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                        )}
                        {score?.promoted_to && (
                            <div>
                                <span className="text-gray-500 text-xs">Promoted To:</span>
                                <span className="ml-2 font-bold text-emerald-700">{score.promoted_to}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <p>Generated on {new Date().toLocaleDateString('en-NG', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    <p className="italic">This is a computer-generated document</p>
                    <p>{settings?.school_name}</p>
                </div>
            </div>
            
            {/* Bottom Decorative Border */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-brand-500 to-brand-700" />
        </div>
    );
};
