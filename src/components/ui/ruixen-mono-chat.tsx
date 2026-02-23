"use client";

import React, { useState } from "react";
import {
    SmilePlus,
    Send,
    CheckCheck,
    Check,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    sender: {
        name: string;
        avatar: string;
        isOnline: boolean;
    };
    timestamp: string;
    status: "sent" | "delivered" | "read";
    reactions?: Array<{
        emoji: string;
        count: number;
        reacted: boolean;
    }>;
}

interface Conversation {
    id: string;
    customer_id: string;
    provider_id: string;
    last_message_at: string;
    created_at: string;
    customer?: {
        id: string;
        full_name: string;
        avatar_url: string;
        email: string;
    };
    provider?: {
        id: string;
        business_name: string;
        user_id: string;
        user: {
            id: string;
            full_name: string;
            avatar_url: string;
            email: string;
        };
    };
}

interface RuixenCard04Props {
    chatName?: string;
    messages?: Message[];
    className?: string;
    onSendMessage?: (message: string) => void;
    onAddReaction?: (messageId: string, emoji: string) => void;
    conversations?: Conversation[];
    selectedConversation?: Conversation | null;
    onConversationSelect?: (conversation: Conversation) => void;
    conversationId?: string | null;
}

export default function RuixenCard04({
    chatName = "PetiFy Chat",
    messages = [],
    className,
    onSendMessage,
    onAddReaction,
    conversations = [],
    selectedConversation,
    onConversationSelect,
    conversationId,
}: RuixenCard04Props) {
    const [selectedSender, setSelectedSender] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");

    // Use conversations for participants list
    const participants = conversations.map(conv => {
        const isProvider = conv.provider?.user_id;
        const participant = isProvider ? conv.customer : conv.provider?.user;
        return {
            id: conv.id,
            name: isProvider ? 
                (conv.customer?.full_name || conv.customer?.email || 'Customer') :
                (conv.provider?.business_name || conv.provider?.user?.full_name || 'Provider'),
            avatar: isProvider ? 
                (conv.customer?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face') :
                (conv.provider?.user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
            isOnline: true, // TODO: Implement real-time presence
            conversation: conv
        };
    });

    // Filter messages by selected conversation or show all
    const filteredMessages = selectedConversation ? messages : messages;

    const handleSendMessage = () => {
        if (newMessage.trim() && onSendMessage) {
            onSendMessage(newMessage.trim());
            setNewMessage("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={cn(
            "w-full h-full bg-white dark:bg-black flex flex-col border border-gray-300 dark:border-gray-700",
            className
        )}>

            {/* Body */}
            <main className="flex flex-1 overflow-hidden border-t border-gray-300 dark:border-gray-700">
                {/* Participants List */}
                <aside className="w-56 bg-gray-50 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
                    {participants.map((participant) => {
                        const isSelected = selectedConversation?.id === participant.id;
                        return (
                            <button
                                key={participant.id}
                                onClick={() => onConversationSelect?.(participant.conversation)}
                                className={cn(
                                    "flex items-center gap-3 w-full p-3 mb-3 rounded-lg transition-colors",
                                    isSelected
                                        ? "bg-black dark:bg-white text-white dark:text-black"
                                        : "hover:bg-gray-200 dark:hover:bg-gray-800 text-foreground dark:text-muted-foreground/60"
                                )}
                            >
                                <div className="relative">
                                    <Image
                                        src={participant.avatar}
                                        alt={participant.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full ring-1 ring-gray-400 dark:ring-gray-600"
                                    />
                                    <span
                                        className={cn(
                                            "absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-black",
                                            participant.isOnline
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                        )}
                                    />
                                </div>
                                <span className="text-left font-medium truncate">
                                    {participant.name}
                                </span>
                            </button>
                        );
                    })}
                </aside>

                {/* Messages */}
                <section className="flex-1 p-4 overflow-y-auto bg-white dark:bg-black">
                    {filteredMessages.length === 0 ? (
                        <p className="text-center text-muted-foreground dark:text-muted-foreground">
                            No messages to display.
                        </p>
                    ) : (
                        filteredMessages.map((message) => (
                            <div
                                key={message.id}
                                className="mb-6 last:mb-0 group border-b border-gray-200 dark:border-gray-800 pb-4"
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <Image
                                        src={message.sender.avatar}
                                        alt={message.sender.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full ring-1 ring-gray-400 dark:ring-gray-600"
                                    />
                                    <div>
                                        <p className="font-semibold text-black dark:text-white">
                                            {message.sender.name}
                                        </p>
                                        <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                                            {message.timestamp}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-foreground dark:text-muted-foreground/40 text-lg mb-1">
                                    {message.content}
                                </p>
                                <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        {message.status === "read" && (
                                            <CheckCheck className="w-5 h-5 text-green-500" />
                                        )}
                                        {message.status === "delivered" && (
                                            <Check className="w-5 h-5" />
                                        )}
                                        <span>{message.timestamp}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {message.reactions?.map((reaction) => (
                                            <button
                                                key={reaction.emoji}
                                                onClick={() => onAddReaction?.(message.id, reaction.emoji)}
                                                className={cn(
                                                    "px-2 py-1 rounded-md text-sm transition-colors",
                                                    reaction.reacted
                                                        ? "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                                                        : "bg-gray-100 dark:bg-gray-800 text-foreground dark:text-muted-foreground",
                                                    "hover:bg-gray-200 dark:hover:bg-gray-600"
                                                )}
                                            >
                                                {reaction.emoji} {reaction.count}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="flex items-center gap-4 border-t border-gray-300 dark:border-gray-700 p-4">
                <button
                    aria-label="Add emoji"
                    className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <SmilePlus className="w-6 h-6 text-muted-foreground dark:text-muted-foreground/60" />
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Write your message..."
                    className={cn(
                        "flex-1 px-5 py-3 rounded-full border border-gray-300 dark:border-gray-700",
                        "bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    )}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    aria-label="Send message"
                    className="p-3 rounded-full bg-black dark:bg-white text-white dark:text-black hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-6 h-6" />
                </button>
            </footer>
        </div>
    );
}
