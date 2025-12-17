'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Send, ThumbsDown, ThumbsUp, PlusCircle } from 'lucide-react';
import { Bot, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { handleUserQuery, handleFeedback } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  suggestions?: string[];
  endOfTurn?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 'init-1',
    role: 'bot',
    text: "Hello! I'm Collegewala. I can help you with questions about admissions, courses, fees, and more. How can I assist you today?",
    suggestions: [
      "What courses are offered?",
      "How can I apply for admission?",
      "Is hostel facility available?",
      "What is the fee structure?",
    ],
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    const handleSessionChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { sessionId } = customEvent.detail;
      loadSession(sessionId);
    };
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'currentChatSessionId') {
            loadSession(e.newValue!);
        }
    };

    window.addEventListener('sessionChanged', handleSessionChanged);
    window.addEventListener('storage', handleStorageChange);


    // Initial load
    const savedSessionId = localStorage.getItem('currentChatSessionId');
    if (savedSessionId) {
      loadSession(savedSessionId);
    } else {
      startNewSession();
    }
    
    return () => {
      window.removeEventListener('sessionChanged', handleSessionChanged);
      window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const loadSession = (sessionId: string) => {
    try {
      const chatHistoryStr = localStorage.getItem('chatHistory') || '{}';
      const history = JSON.parse(chatHistoryStr);
      if (history[sessionId]) {
        setMessages(history[sessionId].messages);
        setCurrentSessionId(sessionId);
      } else {
        startNewSession();
      }
    } catch (error) {
      console.warn('Failed to load chat history, starting new session');
      startNewSession();
    }
  };

  const startNewSession = () => {
    const newId = `session-${Date.now()}`;
    setMessages(initialMessages);
    setCurrentSessionId(newId);
    localStorage.setItem('currentChatSessionId', newId);
    saveChatHistory(newId, 'New Chat', initialMessages);
    // This will trigger the ChatHistory component to update
    window.dispatchEvent(new StorageEvent('storage', { key: 'chatHistory' }));
  };
  
  useEffect(() => {
    if(currentSessionId && messages.length > 1) { // more than initial message
        const userMessages = messages.filter(m => m.role === 'user');
        const firstUserMessage = userMessages.length > 0 ? userMessages[0].text : 'New Chat';
        const newTitle = firstUserMessage.substring(0, 30) + (firstUserMessage.length > 30 ? '...' : '');
        saveChatHistory(currentSessionId, newTitle, messages);
    } else if (currentSessionId) {
        saveChatHistory(currentSessionId, 'New Chat', messages);
    }
    scrollToBottom();
  }, [messages, currentSessionId]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const saveChatHistory = (sessionId: string, title: string, messagesToSave: Message[]) => {
    try {
      const chatHistoryStr = localStorage.getItem('chatHistory') || '{}';
      const history = JSON.parse(chatHistoryStr);
      
      if (typeof history !== 'object' || history === null) {
        throw new Error('Invalid history format');
      }

      const maxStorageSize = 5242880;
      const currentSize = new Blob([chatHistoryStr]).size;
      
      if (currentSize > maxStorageSize) {
        const sessions = Object.keys(history).sort((a, b) => {
          const timeA = new Date(history[a]?.timestamp || 0).getTime();
          const timeB = new Date(history[b]?.timestamp || 0).getTime();
          return timeA - timeB;
        });
        
        while (sessions.length > 0 && new Blob([JSON.stringify(history)]).size > maxStorageSize * 0.8) {
          const oldestSession = sessions.shift();
          if (oldestSession) {
            delete history[oldestSession];
          }
        }
      }

      const updatedSession: ChatSession = {
          id: sessionId,
          title: title,
          messages: messagesToSave,
          timestamp: history[sessionId]?.timestamp || new Date().toISOString(),
      };
      history[sessionId] = updatedSession;
      localStorage.setItem('chatHistory', JSON.stringify(history));
      window.dispatchEvent(new StorageEvent('storage', { key: 'chatHistory' }));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  };

  const handleSubmit = async (query?: string) => {
    const userQuery = query || input;
    if (!userQuery.trim()) return;

    setMessages(prev => prev.map(m => ({ ...m, endOfTurn: false, suggestions: [] })));

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userQuery,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      const result = await handleUserQuery(userQuery);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: result.answer,
        suggestions: result.suggestions,
        endOfTurn: true,
      };
      setMessages(prev => [...prev, botMessage]);
    });
  };

  const handleFollowUp = (positive: boolean) => {
    setMessages(prev => prev.map(m => ({ ...m, endOfTurn: false }))); // Hide buttons

    if (positive) {
      const botMessage: Message = {
        id: `bot-follow-up-${Date.now()}`,
        role: 'bot',
        text: "How can I help you?",
      };
      setMessages(prev => [...prev, botMessage]);
    } else {
      const botMessage: Message = {
        id: `bot-feedback-prompt-${Date.now()}`,
        role: 'bot',
        text: "Thank you for using Collegewala! Your feedback is valuable to us. How would you rate your experience?",
        endOfTurn: 'feedback' as any, // Special state for feedback
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleFeedbackSubmit = async (feedback: 'good' | 'bad') => {
    setMessages(prev => prev.map(m => ({ ...m, endOfTurn: false })));

    const historyForFeedback = messages.map(m => ({ role: m.role, text: m.text }));

    try {
      await handleFeedback(historyForFeedback, feedback);
    } catch (error) {
      console.error("Failed to submit feedback", error);
    } finally {
      const thankYouMessage: Message = {
        id: `bot-feedback-thanks-${Date.now()}`,
        role: 'bot',
        text: "Thanks for your feedback! If you have more questions, just ask.",
      };
      setMessages(prev => [...prev, thankYouMessage]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.endOfTurn === true) {
      return (
        <div className="mt-4 space-y-3 pt-2 border-t border-slate-200/50">
           <p className="text-sm font-medium">Was this helpful?</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleFollowUp(true)}
              className="flex-1 rounded-lg border-slate-300 hover:bg-blue-50 hover:border-blue-400 transition-colors"
            >
              ✓ Yes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleFollowUp(false)}
              className="flex-1 rounded-lg border-slate-300 hover:bg-red-50 hover:border-red-400 transition-colors"
            >
              ✗ No
            </Button>
          </div>
        </div>
      );
    }
    if (message.endOfTurn === 'feedback' as any) {
      return (
         <div className="mt-4 flex gap-2 pt-2 border-t border-slate-200/50">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeedbackSubmit('good')}
              className="rounded-lg border-slate-300 hover:bg-green-50 hover:border-green-400 transition-colors"
              title="Helpful response"
            >
                <ThumbsUp size={18} />
            </Button>
             <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeedbackSubmit('bad')}
              className="rounded-lg border-slate-300 hover:bg-red-50 hover:border-red-400 transition-colors"
              title="Not helpful"
            >
                <ThumbsDown size={18} />
            </Button>
        </div>
      )
    }
    if (message.suggestions && message.suggestions.length > 0) {
      return (
        <div className="mt-4 space-y-2 pt-2 border-t border-slate-200/50">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Suggested questions:</p>
          {message.suggestions.map((s, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="h-auto w-full justify-start whitespace-normal text-left rounded-lg border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 text-slate-700 hover:text-indigo-700"
              onClick={() => handleSuggestionClick(s)}
            >
              <span className="text-indigo-500 mr-2">→</span>
              {s}
            </Button>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="flex w-full justify-center">
            <div className="w-full max-w-4xl space-y-4 px-4 py-8">
              {messages.map(m => (
                <div 
                  key={m.id} 
                  className={cn('flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300', m.role === 'user' && 'flex-row-reverse')}
                >
                  <div className="shrink-0">
                    {m.role === 'bot' && (
                      <Avatar className="h-9 w-9 border-2 border-indigo-200 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                          <Bot size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {m.role === 'user' && (
                      <Avatar className="h-9 w-9 border-2 border-blue-200 shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-xs font-bold">
                          <User size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className={cn('flex flex-col gap-3 max-w-md', m.role === 'user' && 'items-end')}>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 shadow-md break-words border transition-all duration-200',
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400/50 rounded-br-none'
                          : 'bg-white text-slate-900 border-slate-200/80 rounded-bl-none',
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                      {renderMessageContent(m)}
                    </div>
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="shrink-0">
                    <Avatar className="h-9 w-9 border-2 border-indigo-200 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                        <Bot size={20} />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-2 rounded-2xl bg-white p-4 shadow-md border border-slate-200/80 rounded-bl-none">
                    <Skeleton className="h-4 w-48 bg-slate-200" />
                    <Skeleton className="h-4 w-32 bg-slate-200" />
                  </div>
                </div>
              )}
              <div className="h-4" />
            </div>
          </div>
        </ScrollArea>
      </div>
      <div className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm px-4 py-4 shadow-lg">
        <div className="flex w-full justify-center">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex w-full max-w-4xl items-end gap-3"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={startNewSession}
              className="shrink-0 rounded-full hover:bg-blue-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Start new chat"
            >
              <PlusCircle className="h-6 w-6" />
              <span className="sr-only">New Chat</span>
            </Button>
            <Textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about Collegewala..."
              className="flex-1 resize-none border-2 border-slate-200/80 rounded-2xl bg-white text-slate-900 shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 placeholder:text-slate-400 transition-all duration-200 px-4 py-3"
              rows={1}
              disabled={isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isPending || !input.trim()}
              className="shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
