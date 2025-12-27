import React, { useState } from 'react';
import { Save } from 'lucide-react';
import * as Types from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-provider';

interface SettingsViewProps {
    settings: Types.Settings;
    onUpdate: (s: Types.Settings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate }) => {
    const [formData, setFormData] = useState<Types.Settings>(settings);
    const { addToast } = useToast();
    const handleChange = (field: keyof Types.Settings, value: any) => { setFormData(prev => ({ ...prev, [field]: value })); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Types.Settings) => {
        const file = e.target.files?.[0];
        if (file) { const reader = new FileReader(); reader.onloadend = () => { handleChange(field, reader.result as string); }; reader.readAsDataURL(file); }
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ ...formData, updated_at: Date.now() }); addToast('Settings updated successfully', 'success'); };
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Settings & Branding</h1><p className="text-gray-500">Configure school identity, session details, and report card assets.</p></div><Button onClick={handleSubmit}><Save className="h-4 w-4 mr-2" /> Save Changes</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="School Profile">
                    <div className="space-y-4"><Input label="School Name" value={formData.school_name} onChange={e => handleChange('school_name', e.target.value)} /><Input label="Email" value={formData.school_email} onChange={e => handleChange('school_email', e.target.value)} /><Input label="Phone" value={formData.school_phone} onChange={e => handleChange('school_phone', e.target.value)} /><Input label="Address" value={formData.school_address} onChange={e => handleChange('school_address', e.target.value)} /><Input label="Tagline" value={formData.school_tagline} onChange={e => handleChange('school_tagline', e.target.value)} /></div>
                </Card>
                <Card title="Session & Display">
                    <div className="space-y-4">
                        <Input label="Current Session" value={formData.current_session} onChange={e => handleChange('current_session', e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <Select label="Current Term" value={formData.current_term} onChange={e => handleChange('current_term', e.target.value)}><option>First Term</option><option>Second Term</option><option>Third Term</option></Select>
                            <Input label="Next Term Begins" type="date" value={formData.next_term_begins} onChange={e => handleChange('next_term_begins', e.target.value)} />
                        </div>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="show_position" checked={formData.show_position} onChange={e => handleChange('show_position', e.target.checked)} className="h-4 w-4 text-brand-600 border-gray-300 rounded" />
                                <label htmlFor="show_position" className="text-sm font-medium text-gray-700">Display Student Rank/Position</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="show_skills" checked={formData.show_skills} onChange={e => handleChange('show_skills', e.target.checked)} className="h-4 w-4 text-brand-600 border-gray-300 rounded" />
                                <label htmlFor="show_skills" className="text-sm font-medium text-gray-700">Display Skills & Behavior Domain</label>
                            </div>
                            <div className="pt-2">
                                <Select label="Report Card Font" value={formData.report_font_family} onChange={e => handleChange('report_font_family', e.target.value)}>
                                    <option value="inherit">Default (Inter)</option>
                                    <option value="'Roboto', sans-serif">Roboto</option>
                                    <option value="'Montserrat', sans-serif">Montserrat</option>
                                    <option value="Georgia, serif">Classic Serif (Georgia)</option>
                                    <option value="'Courier New', monospace">Typewriter (Mono)</option>
                                </Select>
                            </div>
                            <div className="pt-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Report Card Scale: {formData.report_scale}%</label>
                                <input
                                    type="range"
                                    min="70"
                                    max="100"
                                    step="5"
                                    value={formData.report_scale}
                                    onChange={e => handleChange('report_scale', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                />
                                <p className="text-[10px] text-gray-500 italic">Reduce if the report card is too large for your paper.</p>
                            </div>
                            <div className="flex items-center gap-2 text-brand-600 border-t pt-3">
                                <input type="checkbox" id="tiled_watermark" checked={formData.tiled_watermark} onChange={e => handleChange('tiled_watermark', e.target.checked)} className="h-4 w-4 text-brand-600 border-gray-300 rounded" />
                                <label htmlFor="tiled_watermark" className="text-sm font-bold">Tile Watermark (Repeating)</label>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card title="Branding & Signatories">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Class Teacher Label" value={formData.class_teacher_label} onChange={e => handleChange('class_teacher_label', e.target.value)} />
                            <Input label="Head Teacher Label" value={formData.head_teacher_label} onChange={e => handleChange('head_teacher_label', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">School Logo</label>
                                <input type="file" className="text-xs mt-1 block w-full" onChange={e => handleFileChange(e, 'logo_media')} />
                                {formData.logo_media && <img src={formData.logo_media} className="mt-2 h-12 object-contain border" />}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Watermark</label>
                                <input type="file" className="text-xs mt-1 block w-full" onChange={e => handleFileChange(e, 'watermark_media')} />
                                {formData.watermark_media && <img src={formData.watermark_media} className="mt-2 h-12 object-contain border" />}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 border-t pt-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">{formData.head_teacher_label} Signature</label>
                                <input type="file" className="text-xs mt-1 block w-full" onChange={e => handleFileChange(e, 'head_of_school_signature')} />
                                {formData.head_of_school_signature && <img src={formData.head_of_school_signature} className="mt-2 h-12 object-contain border border-dashed p-1" />}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
