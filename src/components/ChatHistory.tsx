'use client';

import React, { useState, useEffect } from 'react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

export function ChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const { state } = useSidebar();

  useEffect(() => {
    const loadHistory = () => {
      const storedHistory = localStorage.getItem('chatHistory');
      if (storedHistory) {
        setSessions(Object.values(JSON.parse(storedHistory)));
      }
    };
    
    loadHistory();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'chatHistory') {
            loadHistory();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const handleSessionClick = (sessionId: string) => {
    localStorage.setItem('currentChatSessionId', sessionId);
    window.dispatchEvent(new CustomEvent('sessionChanged', { detail: { sessionId } }));
  };

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    localStorage.setItem('currentChatSessionId', newId);
    window.dispatchEvent(new CustomEvent('sessionChanged', { detail: { sessionId: newId } }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'chatHistory' }));
  };

  const handleDeleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      const history = JSON.parse(storedHistory);
      delete history[sessionId];
      localStorage.setItem('chatHistory', JSON.stringify(history));
      window.dispatchEvent(new StorageEvent('storage', { key: 'chatHistory' }));
      
      const currentSessionId = localStorage.getItem('currentChatSessionId');
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex flex-col h-full w-full">
        <div className="px-1.5 py-2 border-b border-slate-200">
            {state === 'expanded' && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex-shrink-0 p-1 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md">
                  <Logo />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent leading-tight">
                    Collegewala
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">AI Assistant</p>
                </div>
              </div>
            )}
        </div>
        <div className="px-1.5 py-2 border-b border-slate-200">
            <Button 
              onClick={handleNewChat}
              className="w-full flex items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm font-medium transition-all duration-200 text-xs"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              {state === 'expanded' ? 'New Chat' : ''}
            </Button>
        </div>
        <SidebarGroup className="pb-1">
            {state === 'expanded' && <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">Chat History</SidebarGroupLabel>}
        </SidebarGroup>
        <ScrollArea className="flex-1 w-full">
            <SidebarMenu className="gap-1">
            {sortedSessions.map(session => (
                <SidebarMenuItem key={session.id} className="px-1 group">
                <div className="flex items-center gap-0.5">
                  <SidebarMenuButton 
                      onClick={() => handleSessionClick(session.id)}
                      tooltip={session.title}
                      className="rounded-sm text-xs flex-1"
                  >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="truncate">{session.title}</span>
                  </SidebarMenuButton>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteChat(session.id, e)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50 hover:text-red-700"
                    title="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </ScrollArea>
    </div>
  );
}
