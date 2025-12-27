'use client';
import { useState } from 'react';
import { useSchoolStore } from '@/lib/store';
import { GradingView } from '@/components/features/GradingView';
import { SubjectTeacherManager } from '@/components/features/grading/SubjectTeacherManager';
import { TermComparisonView } from '@/components/features/grading/TermComparisonView';
import { PromotionManager } from '@/components/features/grading/PromotionManager';

export default function GradingPage() {
    const { students, classes, scores, settings, setScores } = useSchoolStore();
    const [activeTab, setActiveTab] = useState<'grading' | 'comparison' | 'promotion' | 'assignments'>('grading');

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('grading')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'grading' ? 'bg-white shadow text-brand-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Score Entry
                </button>
                <button
                    onClick={() => setActiveTab('comparison')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'comparison' ? 'bg-white shadow text-brand-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Term Comparison
                </button>
                <button
                    onClick={() => setActiveTab('promotion')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'promotion' ? 'bg-white shadow text-brand-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Promotions
                </button>
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'assignments' ? 'bg-white shadow text-brand-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Subject Teachers
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'grading' && (
                <GradingView
                    students={students}
                    classes={classes}
                    scores={scores}
                    settings={settings}
                    onSaveScores={setScores}
                />
            )}

            {activeTab === 'comparison' && (
                <TermComparisonView
                    students={students}
                    classes={classes}
                    scores={scores}
                    settings={settings}
                />
            )}

            {activeTab === 'promotion' && (
                <PromotionManager />
            )}

            {activeTab === 'assignments' && (
                <SubjectTeacherManager />
            )}
        </div>
    );
}
