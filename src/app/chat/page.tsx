"use client";

import React from "react";
import { ChatPage } from "@/components/ui/chat-page";

export default function CustomerChatPage() {
    return (
        <div className="h-screen w-full">
            <ChatPage
                chatName="Chat with Provider"
                currentUserId="customer"
                otherUserId="provider"
            />
        </div>
    );
}
