"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { chatService } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestChatPersistencePage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const convos = await chatService.getConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to test chat persistence.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Chat Persistence Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversations */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <Button onClick={loadConversations} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <p className="text-gray-500">No conversations found.</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conv.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => loadMessages(conv.id)}
                    >
                      <div className="font-medium">
                        {conv.customer?.full_name || 'Customer'} ↔ {conv.provider?.business_name || 'Provider'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last message: {new Date(conv.last_message_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>
                Messages {selectedConversation && `(${messages.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedConversation ? (
                <p className="text-gray-500">Select a conversation to view messages.</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-500">No messages found.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender.id === user.id
                          ? 'bg-blue-100 ml-8'
                          : 'bg-gray-100 mr-8'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {msg.sender.full_name || msg.sender.email}
                      </div>
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to a provider page and click "Chat with [Provider Name]"</li>
                <li>Send a few messages in the chat</li>
                <li>Come back to this page and click "Refresh" to see the conversation</li>
                <li>Click on the conversation to see the messages</li>
                <li>Open the chat from another browser/device to verify messages persist</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
