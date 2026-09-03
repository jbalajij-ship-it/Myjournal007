import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  Compass, 
  FileText, 
  Lightbulb, 
  AlertCircle, 
  RotateCcw,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import { JournalEntry, JournalMessage, ReflectionMode, UserProfile } from '../types';

interface ActiveJournalViewProps {
  entry: JournalEntry;
  user: UserProfile;
  isGenerating: boolean;
  onSendMessage: (content: string, mode: ReflectionMode) => Promise<void>;
  onUpdateTitle: (newTitle: string) => void;
  onChangeMode: (mode: ReflectionMode) => void;
  error: string | null;
  onClearError: () => void;
}

export const ActiveJournalView: React.FC<ActiveJournalViewProps> = ({
  entry,
  user,
  isGenerating,
  onSendMessage,
  onUpdateTitle,
  onChangeMode,
  error,
  onClearError,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(entry.title || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleInput(entry.title || '');
  }, [entry.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.messages, isGenerating]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTitleSubmit = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== entry.title) {
      onUpdateTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const text = inputText.trim();
    setInputText('');
    onClearError();

    await onSendMessage(text, entry.mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    {
      title: 'Deconstruct Feelings',
      text: "I'm feeling a mix of anxiety and excitement about an upcoming milestone. Can you help me separate what I can control from what I can't?",
    },
    {
      title: 'Actionable Summary',
      text: "Here is what happened today at work. Can you help me distill 3 concrete lessons or next steps?",
    },
    {
      title: 'Alternative Perspective',
      text: "I felt frustrated during a conversation earlier. Could you provide a counter-perspective or explain how the other person might have seen it?",
    },
    {
      title: 'Mindful Gratitude',
      text: "Reflecting on small wins from this week that made a meaningful difference in my mental state.",
    },
  ];

  return (
    <div id="active-journal-view" className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[#080808] overflow-hidden">
      {/* Entry Top Header */}
      <div id="entry-header-bar" className="border-b border-[#1f1f1f] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a]/90">
        {/* Title and date */}
        <div className="flex-1 min-w-[200px]">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                id="entry-title-input"
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTitleInput(entry.title || '');
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-base font-bold text-[#f5f5f5] bg-[#121212] border border-[#2e2e2e] rounded px-2 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-neutral-600"
              />
              <button
                id="save-title-btn"
                onClick={handleTitleSubmit}
                className="text-xs text-neutral-300 bg-[#1e1e1e] hover:bg-[#282828] border border-[#2c2c2c] px-2 py-1 rounded cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 
                id="entry-title-display" 
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
                className="text-base sm:text-lg font-bold text-[#f5f5f5] truncate hover:text-neutral-300 cursor-pointer"
              >
                {entry.title || 'Untitled Reflection'}
              </h1>
              <button
                id="edit-title-btn"
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white rounded transition-opacity cursor-pointer"
                aria-label="Edit title"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-2xs text-neutral-500 mt-0.5">
            Started on {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} · Saved in Cloud Firestore
          </p>
        </div>

        {/* Reflection Mode Switcher */}
        <div id="reflection-mode-selector" className="flex items-center gap-1 bg-[#141414] border border-[#222222] p-1 rounded-xl">
          <button
            id="mode-btn-reflect"
            onClick={() => onChangeMode('reflect')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              entry.mode === 'reflect'
                ? 'bg-[#222222] text-[#f5f5f5] border border-[#333333] shadow-xs'
                : 'text-neutral-400 hover:text-[#f5f5f5]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Reflect & Deepen</span>
            <span className="sm:hidden">Reflect</span>
          </button>

          <button
            id="mode-btn-summarize"
            onClick={() => onChangeMode('summarize')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              entry.mode === 'summarize'
                ? 'bg-[#222222] text-[#f5f5f5] border border-[#333333] shadow-xs'
                : 'text-neutral-400 hover:text-[#f5f5f5]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Actionable Summary</span>
            <span className="sm:hidden">Summary</span>
          </button>

          <button
            id="mode-btn-brainstorm"
            onClick={() => onChangeMode('brainstorm')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              entry.mode === 'brainstorm'
                ? 'bg-[#222222] text-[#f5f5f5] border border-[#333333] shadow-xs'
                : 'text-neutral-400 hover:text-[#f5f5f5]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Brainstorm Ideas</span>
            <span className="sm:hidden">Ideas</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div 
          id="journal-error-banner"
          className="mx-4 sm:mx-8 mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            id="dismiss-error-btn"
            onClick={onClearError}
            className="text-red-400 hover:text-red-200 font-semibold cursor-pointer underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Stream Area */}
      <div id="messages-scroll-area" className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {entry.messages.length === 0 ? (
          /* Empty entry view with inspiration */
          <div id="empty-entry-prompt" className="max-w-2xl mx-auto py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#f5f5f5] tracking-tight">
              Begin your reflection
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
              Write whatever is genuinely present for you. Gemini will provide a compassionate reflection, thematic summary, or alternative viewpoints.
            </p>

            {/* Quick Inspiration Chips */}
            <div className="mt-8 text-left">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 text-center">
                Need a prompt to start?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    id={`quick-prompt-btn-${idx}`}
                    onClick={() => {
                      setInputText(p.text);
                      textareaRef.current?.focus();
                    }}
                    className="p-3.5 rounded-xl border border-[#222222] hover:border-[#383838] bg-[#0e0e0e] hover:bg-[#141414] text-left transition-all group shadow-2xs cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-[#f5f5f5] group-hover:text-white">
                      {p.title}
                    </p>
                    <p className="text-2xs text-neutral-400 mt-1 line-clamp-2">
                      "{p.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Render conversation turns */
          entry.messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                id={`message-row-${message.id}`}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] text-amber-300 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  id={`message-bubble-${message.id}`}
                  className={`group relative rounded-2xl px-4 py-3.5 text-sm ${
                    isUser
                      ? 'bg-[#1a1a1a] border border-[#2c2c2c] text-[#f5f5f5] rounded-tr-xs shadow-xs'
                      : 'bg-[#0e0e0e] border border-[#1f1f1f] text-neutral-300 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {/* Assistant metadata header */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-[#1c1c1c] text-2xs text-neutral-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-300">Gemini Assistant</span>
                        {message.modelUsed && (
                          <span className="bg-[#161616] text-neutral-400 border border-[#262626] px-1.5 py-0.2 rounded font-mono text-3xs">
                            {message.modelUsed}
                          </span>
                        )}
                      </span>
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Message content */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-[#f5f5f5]">
                      {message.content}
                    </div>
                  ) : (
                    <div className="markdown-body text-neutral-300 text-sm leading-relaxed space-y-2">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  )}

                  {/* Bubble footer / copy button */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 text-2xs opacity-80">
                    {isUser && (
                      <span className="text-3xs text-neutral-500">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <button
                      id={`copy-msg-btn-${message.id}`}
                      onClick={() => handleCopyText(message.id, message.content)}
                      title="Copy content"
                      className={`p-1 rounded transition-colors cursor-pointer ml-auto ${
                        isUser 
                          ? 'text-neutral-400 hover:text-white hover:bg-[#252525]' 
                          : 'text-neutral-500 hover:text-neutral-200 hover:bg-[#1a1a1a]'
                      }`}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] text-[#f5f5f5] flex items-center justify-center shrink-0 mt-1 font-semibold text-xs border border-[#2a2a2a]">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Gemini Generating Thinking State */}
        {isGenerating && (
          <div id="gemini-thinking-indicator" className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] text-amber-300 flex items-center justify-center shrink-0 mt-1 shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-[#0e0e0e] border border-[#1f1f1f] text-neutral-300 text-xs flex items-center gap-3 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div className="flex flex-col">
                <span className="font-semibold text-[#f5f5f5]">
                  Reflecting with Gemini 3.6 Flash...
                </span>
                <span className="text-2xs text-neutral-400 mt-0.5">
                  Analyzing insights, clarifying perspectives, and preparing response.
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Workspace */}
      <div id="journal-input-bar" className="border-t border-[#1f1f1f] p-4 sm:p-6 bg-[#0a0a0a]/90">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl border border-[#262626] bg-[#111111] shadow-xs focus-within:ring-1 focus-within:ring-neutral-600 focus-within:border-neutral-500 transition-all">
            <textarea
              id="reflection-input-textarea"
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={
                entry.mode === 'summarize'
                  ? 'Paste or write details to generate an actionable summary with key takeaways...'
                  : entry.mode === 'brainstorm'
                  ? 'Describe a challenge, idea, or block you would like alternative perspectives on...'
                  : 'Write your thoughts, feelings, or reflections here... (Press Enter to send, Shift+Enter for new line)'
              }
              className="w-full p-3.5 text-sm text-[#f5f5f5] placeholder-neutral-500 bg-transparent resize-none focus:outline-hidden leading-relaxed"
            />

            {/* Input Bar Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-[#1a1a1a] bg-[#0e0e0e] rounded-b-2xl">
              <div className="flex items-center gap-2 text-2xs text-neutral-400">
                <span className="hidden sm:inline">
                  Mode: <strong className="text-neutral-300 font-medium capitalize">{entry.mode}</strong>
                </span>
                <span className="text-neutral-700 hidden sm:inline">|</span>
                <span>Shift+Enter for newline</span>
              </div>

              <button
                id="send-reflection-btn"
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg text-[#050505] bg-[#f5f5f5] hover:bg-white disabled:opacity-30 disabled:hover:bg-[#f5f5f5] transition-colors shadow-xs cursor-pointer"
              >
                {isGenerating ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
