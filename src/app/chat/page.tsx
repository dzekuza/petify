"use client";

import React from "react";
import { ChatPage } from "@/components/ui/chat-page";
import { Layout } from "@/components/layout";

export default function CustomerChatPage() {
    return (
        <Layout hideFooter={true}>
            <div className="h-[calc(100vh-7rem)] w-full">
                <ChatPage
                    chatName="Chat with Provider"
                    currentUserId="customer"
                    otherUserId="provider"
                />
            </div>
        </Layout>
    );
}
