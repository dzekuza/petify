"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AIChatCard from "@/components/ui/ai-chat";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface FloatingChatButtonProps {
  providerName?: string;
  providerId?: string;
  providerLogo?: string;
  className?: string;
}

export function FloatingChatButton({
  providerName = "Provider",
  providerId,
  providerLogo,
  className,
}: FloatingChatButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChat = () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/signin';
      return;
    }
    setIsOpen(true);
  };

  const handleSendMessage = (message: string) => {
    // Here you can implement the actual message sending logic
    console.log('Sending message to provider:', providerId, 'Message:', message);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleOpenChat}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-4 py-3 border border-gray-200 hover:border-gray-300 group",
          className
        )}
      >
        {/* Provider Logo */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {providerLogo ? (
            <Image
              src={providerLogo}
              alt={`${providerName} logo`}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {providerName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            Write a message
          </span>
          <span className="text-xs text-gray-500">
            {providerName}
          </span>
        </div>

        {/* Chat Icon */}
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path>
          </svg>
        </div>
      </button>
      
      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md w-full p-0 bg-transparent border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Chat with {providerName}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <AIChatCard
              providerName={providerName}
              providerId={providerId}
              onSendMessage={handleSendMessage}
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
