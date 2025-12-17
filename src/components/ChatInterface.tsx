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
    const history = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    if (history[sessionId]) {
      setMessages(history[sessionId].messages);
      setCurrentSessionId(sessionId);
    } else {
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
    const history = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    const updatedSession: ChatSession = {
        id: sessionId,
        title: title,
        messages: messagesToSave,
        timestamp: history[sessionId]?.timestamp || new Date().toISOString(),
    };
    history[sessionId] = updatedSession;
    localStorage.setItem('chatHistory', JSON.stringify(history));
    window.dispatchEvent(new StorageEvent('storage', { key: 'chatHistory' }));
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
        <div className="mt-3 space-y-2">
           <p className="text-sm mb-2">Do you need more help?</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleFollowUp(true)}>Yes</Button>
            <Button variant="outline" size="sm" onClick={() => handleFollowUp(false)}>No</Button>
          </div>
        </div>
      );
    }
    if (message.endOfTurn === 'feedback' as any) {
      return (
         <div className="mt-3 flex gap-2">
            <Button variant="outline" size="icon" onClick={() => handleFeedbackSubmit('good')}>
                <ThumbsUp />
            </Button>
             <Button variant="outline" size="icon" onClick={() => handleFeedbackSubmit('bad')}>
                <ThumbsDown />
            </Button>
        </div>
      )
    }
    if (message.suggestions && message.suggestions.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {message.suggestions.map((s, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="h-auto w-full justify-start whitespace-normal text-left"
              onClick={() => handleSuggestionClick(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            {messages.map(m => (
              <div key={m.id} className={cn('flex items-start gap-3', m.role === 'user' && 'justify-end')}>
                {m.role === 'bot' && (
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg p-3 shadow-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground max-w-xs'
                      : 'bg-card text-card-foreground max-w-2xl',
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{m.text}</p>
                  {renderMessageContent(m)}
                </div>
                {m.role === 'user' && (
                  <Avatar className="h-8 w-8 border shrink-0">
                     <AvatarFallback className="bg-accent text-accent-foreground">
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
           {isPending && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-2xl space-y-2 rounded-lg bg-card p-3 shadow-sm">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t bg-card/50 px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-end gap-2"
          >
            <Button variant="ghost" size="icon" onClick={startNewSession} className="shrink-0">
              <PlusCircle className="h-5 w-5" />
              <span className="sr-only">New Chat</span>
            </Button>
            <Textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 resize-none border rounded-md bg-background shadow-sm focus-visible:ring-1"
              rows={1}
              disabled={isPending}
            />
            <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="shrink-0">
              <Send size={20} />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
