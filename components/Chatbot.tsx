import React, { useState, useRef, useEffect } from 'react';
import { createGeneralChat, createProfileChat } from '../services/geminiService';
import { ChatBubbleIcon, SendIcon, XIcon, GithubIcon } from './icons';
import { marked } from 'marked';
import type { Chat } from '@google/genai';
import type { GithubProfile, GithubRepo } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  profileData: {
    profile: GithubProfile;
    repos: GithubRepo[];
  } | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ profileData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // This effect creates a new chat session when the profile context changes
    // or initializes a general chat session. It also sets the initial greeting message.
    if (profileData) {
      setChat(createProfileChat(profileData.profile, profileData.repos));
      setMessages([
        {
          role: 'model',
          text: `I'm ready to answer questions about **${profileData.profile.name || profileData.profile.login}**'s profile. What would you like to know?`,
        },
      ]);
    } else {
      setChat(createGeneralChat());
      setMessages([
        { role: 'model', text: 'Hello! How can I help you today? Ask me about GitHub, resumes, or software development.' }
      ]);
    }
    // Reset input and loading state on context change
    setInput('');
    setIsLoading(false);
  }, [profileData]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: currentInput });
      const modelMessage: Message = { role: 'model', text: response.text };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMessage: Message = {
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 lg:right-8 w-[calc(100%-2rem)] max-w-sm h-[60vh] max-h-screen bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 flex flex-col transition-all duration-300 ease-in-out z-40 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Header */}
        <header className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <GithubIcon className="w-6 h-6 text-brand-purple" />
            <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">GitHub Assistant</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Close chat">
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <GithubIcon className="w-6 h-6 text-text-secondary/60 dark:text-text-secondary-dark/60 flex-shrink-0 mb-1" />}
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-brand-purple text-white rounded-br-none' : 'bg-black/5 dark:bg-surface-dark text-text-primary dark:text-text-primary-dark rounded-bl-none'}`}>
                {msg.role === 'model' ? (
                   <div
                    className="text-sm prose prose-sm prose-stone dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
               <GithubIcon className="w-6 h-6 text-text-secondary/60 dark:text-text-secondary-dark/60 flex-shrink-0 mb-1" />
              <div className="px-4 py-3 rounded-2xl bg-black/5 dark:bg-surface-dark rounded-bl-none">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                    <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 flex-shrink-0">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question..."
              className="w-full h-10 max-h-24 p-2 pr-12 rounded-lg bg-surface dark:bg-surface-dark border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-brand-purple focus:outline-none transition-colors resize-none text-sm"
              rows={1}
              aria-label="Chat input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-purple rounded-full text-white transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark focus:ring-brand-purple disabled:bg-gray-400 disabled:dark:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-6 lg:right-8 w-16 h-16 bg-gradient-to-r from-brand-purple to-brand-pink rounded-full text-white shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 z-50 animate-glow"
        aria-label="Toggle chatbot"
      >
        <ChatBubbleIcon className="w-8 h-8" />
      </button>
    </>
  );
};