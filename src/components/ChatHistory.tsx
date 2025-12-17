'use client';

import React, { useState, useEffect } from 'react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

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

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex flex-col h-full w-full">
        <SidebarGroup className="pb-2">
            {state === 'expanded' && <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">Chat History</SidebarGroupLabel>}
        </SidebarGroup>
        <ScrollArea className="flex-1 w-full">
            <SidebarMenu className="gap-1">
            {sortedSessions.map(session => (
                <SidebarMenuItem key={session.id} className="px-2">
                <SidebarMenuButton 
                    onClick={() => handleSessionClick(session.id)}
                    tooltip={session.title}
                    className="rounded-md text-sm"
                >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{session.title}</span>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </ScrollArea>
    </div>
  );
}
