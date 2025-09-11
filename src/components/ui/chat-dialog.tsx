"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import RuixenCard04 from "./ruixen-mono-chat";

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

interface ChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chatName?: string;
    conversationId?: string | null;
}

export function ChatDialog({
    open,
    onOpenChange,
    chatName = "PetiFy Chat",
    conversationId,
}: ChatDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{chatName}</DialogTitle>
                </DialogHeader>
                <div className="h-full flex items-center justify-center p-4">
                    <RuixenCard04
                        chatName={chatName}
                        className="h-full max-h-none w-full"
                        conversationId={conversationId}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
