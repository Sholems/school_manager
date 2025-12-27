'use client';

import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon, Plus, Trash2, Edit, ChevronLeft, ChevronRight,
    GraduationCap, Coffee, FileText, Users, MoreHorizontal
} from 'lucide-react';
import { useSchoolStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/providers/toast-provider';
import * as Utils from '@/lib/utils';
import * as Types from '@/lib/types';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC = () => {
    const { events, addEvent, updateEvent, deleteEvent } = useSchoolStore();
    const { addToast } = useToast();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Types.SchoolEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [eventType, setEventType] = useState<Types.SchoolEvent['event_type']>('academic');
    const [targetAudience, setTargetAudience] = useState<Types.SchoolEvent['target_audience']>('all');

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setEventType('academic');
        setTargetAudience('all');
        setEditingEvent(null);
    };

    const handleOpenModal = (event?: Types.SchoolEvent, date?: string) => {
        if (event) {
            setEditingEvent(event);
            setTitle(event.title);
            setDescription(event.description || '');
            setStartDate(event.start_date);
            setEndDate(event.end_date || '');
            setEventType(event.event_type);
            setTargetAudience(event.target_audience);
        } else {
            resetForm();
            if (date) setStartDate(date);
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!title.trim() || !startDate) {
            addToast('Please fill in required fields', 'warning');
            return;
        }

        const eventData: Types.SchoolEvent = {
            id: editingEvent?.id || Utils.generateId(),
            title: title.trim(),
            description: description.trim() || undefined,
            start_date: startDate,
            end_date: endDate || undefined,
            event_type: eventType,
            target_audience: targetAudience,
            created_at: editingEvent?.created_at || Date.now(),
            updated_at: Date.now()
        };

        if (editingEvent) {
            updateEvent(eventData);
            addToast('Event updated', 'success');
        } else {
            addEvent(eventData);
            addToast('Event created', 'success');
        }

        setIsModalOpen(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        deleteEvent(id);
        addToast('Event deleted', 'info');
    };

    // Calendar calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendarDays = useMemo(() => {
        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month days
        const prevMonthDays = startDayOfWeek;
        const prevMonth = new Date(year, month, 0);
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonth.getDate() - i),
                isCurrentMonth: false
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Next month days to fill the grid
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    }, [year, month, daysInMonth, startDayOfWeek]);

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(e => {
            if (e.start_date === dateStr) return true;
            if (e.end_date) {
                return dateStr >= e.start_date && dateStr <= e.end_date;
            }
            return false;
        });
    };

    const getEventTypeIcon = (type: Types.SchoolEvent['event_type']) => {
        switch (type) {
            case 'academic': return <GraduationCap className="h-3 w-3" />;
            case 'holiday': return <Coffee className="h-3 w-3" />;
            case 'exam': return <FileText className="h-3 w-3" />;
            case 'meeting': return <Users className="h-3 w-3" />;
            default: return <MoreHorizontal className="h-3 w-3" />;
        }
    };

    const getEventTypeColor = (type: Types.SchoolEvent['event_type']) => {
        switch (type) {
            case 'academic': return 'bg-blue-100 text-blue-700';
            case 'holiday': return 'bg-green-100 text-green-700';
            case 'exam': return 'bg-red-100 text-red-700';
            case 'meeting': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage school events and academic calendar</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                </Button>
            </div>

            <Card className="p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {MONTHS[month]} {year}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentDate(new Date(year, month - 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date(year, month + 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                        const dayEvents = getEventsForDate(day.date);
                        const dateStr = day.date.toISOString().split('T')[0];

                        return (
                            <div
                                key={index}
                                className={`min-h-[100px] p-1 border rounded-lg cursor-pointer transition-colors ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                                    } ${isToday(day.date) ? 'border-brand-500 border-2' : 'border-gray-200'} 
                                hover:bg-gray-50`}
                                onClick={() => handleOpenModal(undefined, dateStr)}
                            >
                                <div className={`text-sm font-medium mb-1 ${day.isCurrentMonth
                                        ? isToday(day.date) ? 'text-brand-600' : 'text-gray-900'
                                        : 'text-gray-400'
                                    }`}>
                                    {day.date.getDate()}
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 ${getEventTypeColor(event.event_type)
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenModal(event);
                                            }}
                                        >
                                            {getEventTypeIcon(event.event_type)}
                                            <span className="truncate">{event.title}</span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-gray-500 px-1">
                                            +{dayEvents.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Upcoming Events Sidebar could be added here */}

            {/* Event Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title={editingEvent ? 'Edit Event' : 'New Event'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Event title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Event details..."
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[80px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Event Type"
                            value={eventType}
                            onChange={e => setEventType(e.target.value as Types.SchoolEvent['event_type'])}
                        >
                            <option value="academic">Academic</option>
                            <option value="holiday">Holiday</option>
                            <option value="exam">Examination</option>
                            <option value="meeting">Meeting</option>
                            <option value="other">Other</option>
                        </Select>

                        <Select
                            label="Target Audience"
                            value={targetAudience}
                            onChange={e => setTargetAudience(e.target.value as Types.SchoolEvent['target_audience'])}
                        >
                            <option value="all">Everyone</option>
                            <option value="teachers">Teachers Only</option>
                            <option value="students">Students Only</option>
                            <option value="parents">Parents Only</option>
                        </Select>
                    </div>

                    <div className="flex justify-between pt-4">
                        <div>
                            {editingEvent && (
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        handleDelete(editingEvent.id);
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                {editingEvent ? 'Update' : 'Create'} Event
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
