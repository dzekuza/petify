"use client";

import React from "react";
import { ChatPage } from "@/components/ui/chat-page";

export default function ProviderChatPage() {
    return (
        <div className="h-screen w-full">
            <ChatPage
                chatName="Customer Messages"
                currentUserId="provider"
                otherUserId="customer"
            />
        </div>
    );
}
