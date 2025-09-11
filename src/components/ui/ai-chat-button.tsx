"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AIChatCard from "@/components/ui/ai-chat";
import { useAuth } from "@/contexts/auth-context";

interface AIChatButtonProps {
  providerName?: string;
  providerId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AIChatButton({
  providerName = "Provider",
  providerId,
  variant = "default",
  size = "default",
  className,
}: AIChatButtonProps) {
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
    // For now, we'll just log it
    console.log('Sending message to provider:', providerId, 'Message:', message);
    
    // You can integrate with your existing chat service here
    // Example: chatService.sendMessage(providerId, message);
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
        Chat with {providerName}
      </Button>
      
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
