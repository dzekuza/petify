"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatService, Message as ChatMessage } from "@/lib/chat";
import { useAuth } from "@/contexts/auth-context";

interface Message {
  sender: "ai" | "user";
  text: string;
  timestamp?: Date;
}

interface AIChatCardProps {
  className?: string;
  providerName?: string;
  providerId?: string;
  onSendMessage?: (message: string) => void;
  initialMessages?: Message[];
}

export default function AIChatCard({ 
  className, 
  providerName = "Provider",
  providerId,
  onSendMessage,
  initialMessages 
}: AIChatCardProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      { 
        sender: "ai", 
        text: `👋 Hello! I'm ${providerName}'s AI assistant. How can I help you today?`,
        timestamp: new Date()
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize conversation when component mounts
  useEffect(() => {
    const initializeConversation = async () => {
      if (!user || !providerId) return;
      
      try {
        setIsLoading(true);
        
        // Create or get existing conversation
        const conversation = await chatService.createConversation(user.id, providerId);
        if (conversation) {
          setConversationId(conversation.id);
          
          // Load existing messages
          const existingMessages = await chatService.getMessages(conversation.id);
          if (existingMessages.length > 0) {
            const transformedMessages: Message[] = existingMessages.map(msg => ({
              sender: msg.sender.id === user.id ? "user" : "ai",
              text: msg.content,
              timestamp: new Date(msg.created_at)
            }));
            setMessages(transformedMessages);
          }
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();
  }, [user, providerId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = chatService.subscribeToMessages(conversationId, (newMessage: ChatMessage) => {
      // Only add messages from other users (not the current user)
      if (newMessage.sender.id !== user?.id) {
        const aiMessage: Message = {
          sender: "ai",
          text: newMessage.content,
          timestamp: new Date(newMessage.created_at)
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, user]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || !user) return;
    
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setIsTyping(true);

    try {
      // Send message to database
      const sentMessage = await chatService.sendMessage(conversationId, messageText);
      
      if (sentMessage) {
        // Call the onSendMessage callback if provided
        if (onSendMessage) {
          onSendMessage(messageText);
        }

        // Simulate AI response (in a real app, this would be handled by the provider or a real AI)
        setTimeout(() => {
          const aiResponse: Message = {
            sender: "ai",
            text: `Thank you for your message! ${providerName} will get back to you soon. In the meantime, feel free to ask me about their services, availability, or pricing.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
          setIsTyping(false);
        }, 1200);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col w-full h-full bg-white border border-gray-200 rounded-lg", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          💬 Chat with {providerName}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 text-sm flex flex-col">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="text-gray-500 text-sm">Loading conversation...</div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "px-3 py-2 rounded-lg max-w-[80%]",
                msg.sender === "ai"
                  ? "bg-gray-100 text-gray-900 self-start"
                  : "bg-blue-500 text-white self-end"
              )}
            >
              {msg.text}
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg max-w-[30%] bg-gray-100 self-start">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200"></span>
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-400"></span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t border-gray-200">
          <input
            className="flex-1 px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
}
