'use client';

import React, { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { Send, ThumbsDown, ThumbsUp, PlusCircle, ArrowUp } from 'lucide-react';
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

  const startNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    setMessages(initialMessages);
    setCurrentSessionId(newId);
    localStorage.setItem('currentChatSessionId', newId);
    saveChatHistory(newId, 'New Chat', initialMessages);
    // This will trigger the ChatHistory component to update
    window.dispatchEvent(new StorageEvent('storage', { key: 'chatHistory' }));
  }, []);

  const loadSession = useCallback((sessionId: string) => {
    try {
      const chatHistoryStr = localStorage.getItem('chatHistory') || '{}';
      const history = JSON.parse(chatHistoryStr);
      if (history[sessionId]) {
        setMessages(history[sessionId].messages);
        setCurrentSessionId(sessionId);
      } else {
        startNewSession();
      }
    } catch {
      console.warn('Failed to load chat history, starting new session');
      startNewSession();
    }
  }, [startNewSession]);

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
  }, [loadSession, startNewSession]);
  
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
        endOfTurn: 'feedback' as unknown as boolean, // Special state for feedback
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
        <div className="mt-4 space-y-3 pt-2 border-t border-slate-300">
           <p className="text-sm font-semibold text-slate-700">Was this helpful?</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleFollowUp(true)}
              className="flex-1 rounded-lg border-slate-400 text-slate-700 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-colors font-medium"
            >
              ✓ Yes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleFollowUp(false)}
              className="flex-1 rounded-lg border-slate-400 text-slate-700 hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-colors font-medium"
            >
              ✗ No
            </Button>
          </div>
        </div>
      );
    }
    if (message.endOfTurn === 'feedback' as unknown as boolean) {
      return (
         <div className="mt-4 flex gap-2 pt-2 border-t border-slate-300">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeedbackSubmit('good')}
              className="rounded-lg border-slate-400 text-green-600 hover:bg-green-50 hover:border-green-500 transition-colors"
              title="Helpful response"
            >
                <ThumbsUp size={18} />
            </Button>
             <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeedbackSubmit('bad')}
              className="rounded-lg border-slate-400 text-red-600 hover:bg-red-50 hover:border-red-500 transition-colors"
              title="Not helpful"
            >
                <ThumbsDown size={18} />
            </Button>
        </div>
      )
    }
    if (message.suggestions && message.suggestions.length > 0) {
      return (
        <div className="mt-4 space-y-2 pt-2 border-t border-slate-300">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Suggested questions:</p>
          {message.suggestions.map((s, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="h-auto w-full justify-start whitespace-normal text-left rounded-lg border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 font-medium"
              onClick={() => handleSuggestionClick(s)}
            >
              <span className="text-indigo-600 mr-2">→</span>
              {s}
            </Button>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 gap-0">
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="flex w-full justify-center h-full">
            <div className="w-full space-y-2 px-3 py-3 max-w-4xl">
              {messages.map(m => (
                <div 
                  key={m.id} 
                  className={cn('flex gap-2 items-start animate-in fade-in slide-in-from-bottom-2 duration-300', m.role === 'user' && 'flex-row-reverse')}
                >
                  <div className="shrink-0">
                    {m.role === 'bot' && (
                      <Avatar className="h-7 w-7 border border-indigo-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                          <Bot size={16} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {m.role === 'user' && (
                      <Avatar className="h-7 w-7 border border-blue-200">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-xs font-bold">
                          <User size={16} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className={cn('flex flex-col gap-1.5 max-w-2xl', m.role === 'user' && 'items-end')}>
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 shadow-sm break-words border transition-all duration-200',
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-500 rounded-br-none'
                          : 'bg-white text-slate-800 border-slate-300 rounded-bl-none',
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>
                      {renderMessageContent(m)}
                    </div>
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex gap-2 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="shrink-0">
                    <Avatar className="h-7 w-7 border border-indigo-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1.5 rounded-lg bg-white p-2.5 border border-slate-200/80 rounded-bl-none">
                    <Skeleton className="h-3 w-48 bg-slate-200" />
                    <Skeleton className="h-3 w-32 bg-slate-200" />
                  </div>
                </div>
              )}
              <div className="h-1" />
            </div>
          </div>
        </ScrollArea>
      </div>
      <div className="flex-shrink-0 border-t border-slate-300 bg-white/80 backdrop-blur-md px-3 py-2.5 shadow-lg">
        <div className="flex w-full justify-center">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex w-full max-w-4xl items-end gap-2"
          >
            <Button 
              variant="outline" 
              size="sm"
              onClick={startNewSession}
              className="shrink-0 flex items-center gap-1.5 rounded-md border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all duration-200 font-medium text-xs"
              title="Start new chat"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
            <Textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 resize-none border border-slate-300 rounded-md bg-white text-sm text-slate-900 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 placeholder:text-slate-400 transition-all duration-200 px-3 py-2"
              rows={1}
              disabled={isPending}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={isPending || !input.trim()}
              className="shrink-0 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed p-2"
            >
              <ArrowUp size={18} className="sm:hidden" />
              <span className="hidden sm:flex sm:items-center sm:gap-1.5">
                <Send size={16} />
                <span className="text-xs">Send</span>
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
