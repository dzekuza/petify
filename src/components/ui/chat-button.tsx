"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/ui/chat-dialog";
import { chatService } from "@/lib/chat";
import { useAuth } from "@/contexts/auth-context";

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

interface ChatButtonProps {
    chatName?: string;
    providerId?: string;
    customerId?: string;
    bookingId?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
    className?: string;
}

export function ChatButton({
    chatName = "PetiFy Chat",
    providerId,
    customerId,
    bookingId,
    variant = "default",
    size = "default",
    className,
}: ChatButtonProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const handleOpenChat = async () => {
        if (!user || !providerId) return;

        try {
            // Create or get conversation
            const conversation = await chatService.createConversation(
                customerId || user.id,
                providerId,
                bookingId
            );

            if (conversation) {
                setConversationId(conversation.id);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Error opening chat:', error);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpenChat}
                variant={variant}
                size={size}
                className={className}
            >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
            </Button>
            
            <ChatDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                chatName={chatName}
                conversationId={conversationId}
            />
        </>
    );
}
