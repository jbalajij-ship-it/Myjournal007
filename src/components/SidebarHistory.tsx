import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  Compass, 
  FileText, 
  Lightbulb, 
  X,
  BookOpen
} from 'lucide-react';
import { JournalEntry, ReflectionMode } from '../types';

interface SidebarHistoryProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteRequest: (entry: JournalEntry) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onDeleteRequest,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<ReflectionMode | 'all'>('all');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter by mode
      if (filterMode !== 'all' && entry.mode !== filterMode) {
        return false;
      }
      // Filter by search query in title or message contents
      if (!searchQuery.trim()) {
        return true;
      }
      const q = searchQuery.toLowerCase();
      const inTitle = entry.title?.toLowerCase().includes(q);
      const inMessages = entry.messages?.some((m) => m.content?.toLowerCase().includes(q));
      return inTitle || inMessages;
    });
  }, [entries, searchQuery, filterMode]);

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return 'Recently';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'Recently';
    }
  };

  const getModeIcon = (mode: ReflectionMode) => {
    switch (mode) {
      case 'summarize':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'brainstorm':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-600" />;
      case 'reflect':
      default:
        return <Compass className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        id="history-sidebar"
        className={`fixed lg:static top-16 bottom-0 left-0 z-35 w-80 sm:w-88 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header & Close button for mobile */}
        <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-bold tracking-tight text-[#f5f5f5]">Journal History</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#161616] text-neutral-400 border border-[#262626] font-medium">
              {entries.length}
            </span>
          </div>
          <button
            id="sidebar-close-button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors lg:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-[#1f1f1f]">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search reflections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#111111] border border-[#262626] rounded-lg text-[#f5f5f5] placeholder-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-neutral-600 focus:border-neutral-500 transition-all"
            />
          </div>

          {/* Mode filter chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-2xs">
            <button
              id="filter-all-btn"
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#f5f5f5] text-[#050505]'
                  : 'bg-[#121212] text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a] border border-[#222222]'
              }`}
            >
              All
            </button>
            <button
              id="filter-reflect-btn"
              onClick={() => setFilterMode('reflect')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterMode === 'reflect'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  : 'bg-[#121212] text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a] border border-[#222222]'
              }`}
            >
              <Compass className="w-3 h-3" /> Reflect
            </button>
            <button
              id="filter-summarize-btn"
              onClick={() => setFilterMode('summarize')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterMode === 'summarize'
                  ? 'bg-blue-950 text-blue-300 border border-blue-700/60'
                  : 'bg-[#121212] text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a] border border-[#222222]'
              }`}
            >
              <FileText className="w-3 h-3" /> Summary
            </button>
            <button
              id="filter-brainstorm-btn"
              onClick={() => setFilterMode('brainstorm')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterMode === 'brainstorm'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                  : 'bg-[#121212] text-neutral-400 hover:text-neutral-200 hover:bg-[#1a1a1a] border border-[#222222]'
              }`}
            >
              <Lightbulb className="w-3 h-3" /> Ideas
            </button>
          </div>
        </div>

        {/* Entries list */}
        <div id="history-entry-list" className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredEntries.length === 0 ? (
            <div id="history-empty-state" className="text-center py-12 px-4">
              <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-neutral-400">
                {searchQuery ? 'No matching reflections found.' : 'No journal reflections yet.'}
              </p>
              <p className="text-2xs text-neutral-500 mt-1">
                {searchQuery ? 'Try a different keyword.' : 'Write your first thought to begin.'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isActive = entry.id === activeEntryId;
              const lastMessage = entry.messages[entry.messages.length - 1];
              const snippet = lastMessage?.content || 'No reflection recorded yet.';

              return (
                <div
                  key={entry.id}
                  id={`history-entry-card-${entry.id}`}
                  onClick={() => {
                    onSelectEntry(entry);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative p-3 rounded-xl border transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] border-[#383838] shadow-md ring-1 ring-neutral-700/40'
                      : 'bg-[#0e0e0e] hover:bg-[#141414] border-[#1e1e1e] hover:border-[#2a2a2a] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getModeIcon(entry.mode)}
                      <h3 className="text-xs font-semibold text-[#f5f5f5] truncate">
                        {entry.title || 'Untitled Reflection'}
                      </h3>
                    </div>

                    {/* Delete button */}
                    <button
                      id={`delete-entry-${entry.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(entry);
                      }}
                      title="Delete entry from Firestore"
                      aria-label="Delete entry"
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-2xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {snippet}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1a1a1a] text-2xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      {formatDate(entry.updatedAt || entry.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-neutral-400 bg-[#161616] border border-[#222222] px-1.5 py-0.5 rounded">
                      <MessageSquare className="w-3 h-3" />
                      {entry.messages?.length || 0}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
