import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Loader2 } from 'lucide-react';
import type { ConversationMessage } from '../types';
import { useSession } from '../context/SessionContext';

const QUICK_REPLIES = [
  "I'm interested in performance marketing",
  "What's the fee and EMI options?",
  "Do you offer placement assistance?",
  "I'm a working professional",
  "Tell me about the Analytics course",
  "I want to run ads for my business",
];

const WELCOME_MESSAGE = `Hi! 👋 I'm your AI Admission Counselor at DMI — Digital Marketing Institute.

I'm here to understand your career goals and find the perfect digital marketing course for you. Our AI system will analyze your profile and create a personalized learning path.

To get started — what's your name?`;

export default function ChatPanel() {
  const { messages, isLoading, error, sendMessage, leadProfile } = useSession();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput('');
    await sendMessage(msg);
    inputRef.current?.focus();
  };

  const handleQuickReply = (reply: string) => {
    if (!isLoading) {
      sendMessage(reply);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1 flex items-center gap-1.5">
              <span className="font-medium text-accent-purple">AI Counselor</span>
              <span>·</span>
              <span>Orchestrator</span>
            </div>
            <div className="chat-ai-bubble whitespace-pre-line text-sm leading-relaxed">
              {WELCOME_MESSAGE}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={msg.role === 'user' ? 'flex flex-col items-end' : ''}>
                {msg.role === 'assistant' && (
                  <div className="text-xs text-text-secondary mb-1 flex items-center gap-1.5">
                    <span className="font-medium text-accent-purple">AI Counselor</span>
                    {msg.agent && (
                      <>
                        <span>·</span>
                        <span style={{ color: '#94A3B8' }}>{msg.agent}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="text-xs text-text-secondary mb-1 text-right">{msg.timestamp}</div>
                )}
                <div className={msg.role === 'user' ? 'chat-user-bubble text-sm' : 'chat-ai-bubble text-sm leading-relaxed whitespace-pre-line'}>
                  {msg.content}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
                  {leadProfile?.name?.[0] ?? 'Y'}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="chat-ai-bubble flex items-center gap-2 py-3 px-4">
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#7C3AED' }} />
              <span className="text-xs text-text-secondary">AI agents processing...</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-accent-purple"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-center p-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
          >
            {error}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && (
        <div className="px-5 pb-2">
          <div className="flex gap-2 flex-wrap">
            {QUICK_REPLIES.slice(0, 3).map(reply => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  color: '#A78BFA',
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-secondary outline-none transition-all disabled:opacity-60"
              style={{
                background: 'rgba(18,18,26,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
