"use client";

import React, { useState, useEffect } from "react";
import RuixenCard04 from "./ruixen-mono-chat";
import { chatService, Message, Conversation } from "@/lib/chat";
import { useAuth } from "@/contexts/auth-context";

interface ChatPageProps {
    chatName?: string;
    conversationId?: string;
    currentUserId?: string;
    otherUserId?: string;
}

export function ChatPage({
    chatName = "PetiFy Chat",
    conversationId,
    currentUserId,
    otherUserId,
}: ChatPageProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);

    // Load conversations and messages
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                
                // Load conversations
                const conversationsData = await chatService.getConversations();
                setConversations(conversationsData);
                
                // If a specific conversation is provided, load its messages
                if (conversationId) {
                    const conversation = conversationsData.find(c => c.id === conversationId);
                    if (conversation) {
                        setSelectedConversation(conversation);
                        const messagesData = await chatService.getMessages(conversationId);
                        setMessages(messagesData);
                    }
                } else if (conversationsData.length > 0) {
                    // Load the first conversation by default
                    const firstConversation = conversationsData[0];
                    setSelectedConversation(firstConversation);
                    const messagesData = await chatService.getMessages(firstConversation.id);
                    setMessages(messagesData);
                }
            } catch (error) {
                console.error('Error loading chat data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, conversationId]);

    // Set up real-time subscriptions
    useEffect(() => {
        if (!selectedConversation) return;

        const subscription = chatService.subscribeToMessages(
            selectedConversation.id,
            (newMessage) => {
                setMessages(prev => [...prev, newMessage]);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [selectedConversation]);

    const handleSendMessage = async (content: string) => {
        if (!selectedConversation || !user) return;

        try {
            const newMessage = await chatService.sendMessage(selectedConversation.id, content);
            if (newMessage) {
                setMessages(prev => [...prev, newMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleAddReaction = (messageId: string, emoji: string) => {
        // TODO: Implement reaction functionality with real data
        setMessages(prev => 
            prev.map(msg => {
                if (msg.id === messageId) {
                    const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
                    if (existingReaction) {
                        return {
                            ...msg,
                            reactions: msg.reactions?.map(r => 
                                r.emoji === emoji 
                                    ? { ...r, count: r.count + 1, reacted: !r.reacted }
                                    : r
                            )
                        };
                    } else {
                        return {
                            ...msg,
                            reactions: [
                                ...(msg.reactions || []),
                                { emoji, count: 1, reacted: true }
                            ]
                        };
                    }
                }
                return msg;
            })
        );
    };

    const handleConversationSelect = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        try {
            const messagesData = await chatService.getMessages(conversation.id);
            setMessages(messagesData);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading conversations...</p>
                </div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Start a conversation with a provider</p>
                </div>
            </div>
        );
    }

    return (
        <RuixenCard04
            chatName={selectedConversation ? 
                (user?.user_metadata?.role === 'provider' ? 
                    selectedConversation.customer?.full_name || 'Customer' : 
                    selectedConversation.provider?.business_name || 'Provider'
                ) : chatName
            }
            messages={messages}
            className="h-full w-full"
            onSendMessage={handleSendMessage}
            onAddReaction={handleAddReaction}
            conversations={conversations}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
        />
    );
}
