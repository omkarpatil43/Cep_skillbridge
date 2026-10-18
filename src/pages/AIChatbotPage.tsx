import React, { useEffect, useRef, useState } from 'react';
import { Bot, Check, Copy, RefreshCw, Send, Trash2, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const makeConversationId = () => `conversation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const solveSimpleArithmetic = (value: string): string | null => {
  const normalized = value.toLowerCase()
    .replace(/^(what is|calculate|solve|perform|please)\s+/i, '')
    .replace(/^(the calculation of|the result of)\s+/i, '')
    .replace(/[?=]+$/g, '')
    .trim();
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const left = Number(match[1]);
  const right = Number(match[3]);
  const result = match[2] === '+' ? left + right : match[2] === '-' ? left - right : match[2] === '*' ? left * right : right === 0 ? null : left / right;
  return result === null ? 'Division by zero is undefined.' : `${left} ${match[2]} ${right} = ${result}`;
};

export const AIChatbotPage: React.FC = () => {
  const { currentUser, authToken } = useAuth();
  const [conversationId, setConversationId] = useState(makeConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{
    id: 'welcome',
    role: 'assistant',
    content: `Hi ${currentUser?.name.split(' ')[0] || 'there'}! How can I help you today?`,
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (messageOverride?: string) => {
    const content = (messageOverride ?? inputText).trim();
    if (!content || isTyping) return;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content };
    setMessages(previous => [...previous, userMessage]);
    setInputText('');
    const arithmeticAnswer = solveSimpleArithmetic(content);
    if (arithmeticAnswer) {
      setMessages(previous => [...previous, { id: `assistant-${Date.now()}`, role: 'assistant', content: arithmeticAnswer }]);
      return;
    }
    setIsTyping(true);
    try {
      const response = await api.chat(content, conversationId, authToken || undefined);
      setConversationId(response.conversationId);
      setMessages(previous => [...previous, { id: `assistant-${Date.now()}`, role: 'assistant', content: response.message }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The assistant could not respond right now.';
      setMessages(previous => [...previous, { id: `error-${Date.now()}`, role: 'assistant', content: message, error: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const retryMessage = (message: ChatMessage) => {
    const previousUser = [...messages].reverse().find(candidate => candidate.role === 'user');
    if (previousUser) {
      setMessages(previous => previous.filter(candidate => candidate.id !== message.id));
      void sendMessage(previousUser.content);
    }
  };

  const clearConversation = async () => {
    await api.clearChat(conversationId).catch(() => undefined);
    setConversationId(makeConversationId());
    setMessages([{ id: 'welcome-reset', role: 'assistant', content: 'New conversation started. How can I help?' }]);
  };

  const copyMessage = async (message: ChatMessage) => {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div className="ai-chat-page animate-fade-in">
      <header className="ai-chat-header">
        <div className="ai-chat-brand">
          <div className="ai-chat-icon"><Bot size={24} /></div>
          <div>
            <div className="page-eyebrow">SkillBridge AI</div>
            <h1 className="page-title">AI Assistant</h1>
            <p className="page-subtitle">Ask general questions or get answers grounded in your SkillBridge workspace.</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={clearConversation} title="Clear conversation"><Trash2 size={15} /> New chat</button>
      </header>

      <section className="ai-chat-shell glass-panel">
        <div className="ai-chat-messages" aria-live="polite">
          {messages.map(message => (
            <article key={message.id} className={`ai-message ${message.role === 'user' ? 'ai-message-user' : 'ai-message-assistant'}`}>
              <div className="ai-message-avatar">{message.role === 'user' ? <UserIcon size={17} /> : <Bot size={18} />}</div>
              <div className={`ai-message-body ${message.error ? 'ai-message-error' : ''}`}>
                <div className="ai-message-content">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                          ) : <code className={className} {...props}>{children}</code>;
                        },
                      }}
                    >{message.content}</ReactMarkdown>
                  ) : message.content}
                </div>
                {message.role === 'assistant' && (
                  <div className="ai-message-actions">
                    <button className="btn-icon" onClick={() => copyMessage(message)} title="Copy response">{copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}</button>
                    {message.error && <button className="btn-icon" onClick={() => retryMessage(message)} title="Retry response"><RefreshCw size={14} /></button>}
                  </div>
                )}
              </div>
            </article>
          ))}
          {isTyping && <div className="ai-typing"><span /><span /><span /> Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form className="ai-chat-input" onSubmit={event => { event.preventDefault(); void sendMessage(); }}>
          <textarea
            className="form-control"
            rows={1}
            value={inputText}
            onChange={event => setInputText(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Message SkillBridge AI..."
            aria-label="Message SkillBridge AI"
          />
          <button className="btn btn-primary" type="submit" disabled={!inputText.trim() || isTyping} title="Send message"><Send size={17} /></button>
        </form>
      </section>
    </div>
  );
};

export default AIChatbotPage;
