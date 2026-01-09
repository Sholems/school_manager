'use client';

import React from 'react';
import { Mail, MailOpen, ChevronRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useMessages, useUpdateMessage } from '@/lib/hooks/use-data';
import { useAuth } from '@/components/providers/supabase-auth-provider';
import * as Types from '@/lib/types';
import Link from 'next/link';

interface MessageInboxWidgetProps {
    maxMessages?: number;
    showViewAll?: boolean;
}

export const MessageInboxWidget: React.FC<MessageInboxWidgetProps> = ({
    maxMessages = 3,
    showViewAll = true
}) => {
    const { user: authUser } = useAuth();
    const { data: messages = [] } = useMessages();
    const { mutate: updateMessage } = useUpdateMessage();

    // Get messages for this user
    const myMessages = React.useMemo(() => {
        return messages
            .filter((m: Types.Message) => m.to_id === authUser?.id)
            .sort((a: Types.Message, b: Types.Message) => b.created_at - a.created_at)
            .slice(0, maxMessages);
    }, [messages, authUser?.id, maxMessages]);

    const unreadCount = React.useMemo(() => {
        return messages.filter((m: Types.Message) => m.to_id === authUser?.id && !m.is_read).length;
    }, [messages, authUser?.id]);

    const handleMarkAsRead = (message: Types.Message) => {
        if (!message.is_read) {
            updateMessage({ id: message.id, updates: { is_read: true } });
        }
    };

    if (myMessages.length === 0) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-brand-500" />
                        Messages
                    </h3>
                </div>
                <div className="text-center py-8 text-gray-400">
                    <Mail className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-brand-500" />
                    Messages
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} new
                        </span>
                    )}
                </h3>
                {showViewAll && (
                    <Link href="/messages" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                        View All →
                    </Link>
                )}
            </div>
            <div className="divide-y divide-gray-50">
                {myMessages.map((message: Types.Message) => (
                    <div
                        key={message.id}
                        onClick={() => handleMarkAsRead(message)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !message.is_read ? 'bg-brand-50/50' : ''
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                message.is_read ? 'bg-gray-100 text-gray-500' : 'bg-brand-100 text-brand-600'
                            }`}>
                                {message.is_read ? (
                                    <MailOpen className="h-4 w-4" />
                                ) : (
                                    <Mail className="h-4 w-4" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className={`text-sm truncate ${!message.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {message.subject}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{message.body}</p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(message.created_at).toLocaleDateString('en-NG', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
