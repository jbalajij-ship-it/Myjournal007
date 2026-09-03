/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SidebarHistory } from './components/SidebarHistory';
import { ActiveJournalView } from './components/ActiveJournalView';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { 
  UserProfile, 
  JournalEntry, 
  ReflectionMode, 
  JournalMessage 
} from './types';
import { 
  subscribeToAuthChanges, 
  subscribeToUserInteractions, 
  saveInteraction, 
  deleteInteraction 
} from './lib/firebase';
import { requestGeminiReflection } from './lib/gemini-client';

function createBlankEntry(userId: string): JournalEntry {
  return {
    id: crypto.randomUUID(),
    userId,
    title: 'Untitled Reflection',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: 'reflect',
    messages: [],
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deletion modal state
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Auth subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore interactions subscription for authenticated user
  useEffect(() => {
    if (!currentUser) {
      setEntries([]);
      setActiveEntry(null);
      return;
    }

    const unsubscribe = subscribeToUserInteractions(
      currentUser.uid,
      (userEntries) => {
        setEntries(userEntries);
        // If no active entry is selected, default to the most recent one or blank
        setActiveEntry((prev) => {
          if (!prev) {
            return userEntries.length > 0 ? userEntries[0] : createBlankEntry(currentUser.uid);
          }
          // If previous exists, find updated snapshot or keep current
          const match = userEntries.find((e) => e.id === prev.id);
          return match || prev;
        });
      },
      (err) => {
        console.error('Snapshot subscription error:', err);
        setErrorMessage('Failed to sync changes with Cloud Firestore. Please check your connection.');
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Create a new blank reflection
  const handleNewEntry = useCallback(() => {
    if (!currentUser) return;
    const newDoc = createBlankEntry(currentUser.uid);
    setActiveEntry(newDoc);
    setSaveStatus('idle');
    setErrorMessage(null);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [currentUser]);

  // Update entry title
  const handleUpdateTitle = async (newTitle: string) => {
    if (!activeEntry || !currentUser) return;
    const updated: JournalEntry = {
      ...activeEntry,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    };
    setActiveEntry(updated);

    // Save if entry already contains messages or save immediately
    if (updated.messages.length > 0) {
      try {
        setSaveStatus('saving');
        await saveInteraction(currentUser.uid, updated);
        setSaveStatus('saved');
      } catch (err: any) {
        console.error('Failed to save title:', err);
        setSaveStatus('error');
        setErrorMessage('Could not update title in Firestore. Tap retry.');
      }
    }
  };

  // Change reflection mode
  const handleChangeMode = async (mode: ReflectionMode) => {
    if (!activeEntry || !currentUser) return;
    const updated: JournalEntry = {
      ...activeEntry,
      mode,
      updatedAt: new Date().toISOString(),
    };
    setActiveEntry(updated);

    if (updated.messages.length > 0) {
      try {
        setSaveStatus('saving');
        await saveInteraction(currentUser.uid, updated);
        setSaveStatus('saved');
      } catch (err: any) {
        console.error('Failed to update mode in Firestore:', err);
        setSaveStatus('error');
      }
    }
  };

  // Send message to Gemini and persist to Firestore
  const handleSendMessage = async (content: string, mode: ReflectionMode) => {
    if (!currentUser || !activeEntry) return;

    const userMessage: JournalMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const intermediateMessages = [...activeEntry.messages, userMessage];

    // Optimistically reflect user message in local state
    const intermediateEntry: JournalEntry = {
      ...activeEntry,
      mode,
      messages: intermediateMessages,
      updatedAt: new Date().toISOString(),
    };

    setActiveEntry(intermediateEntry);
    setIsGenerating(true);
    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      // 1. Request Gemini reflection from server-side proxy
      const geminiRes = await requestGeminiReflection({
        prompt: content,
        messages: activeEntry.messages,
        mode,
        title: activeEntry.title,
      });

      const assistantMessage: JournalMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: geminiRes.text,
        timestamp: geminiRes.timestamp || new Date().toISOString(),
        modelUsed: geminiRes.modelUsed,
      };

      const finalMessages = [...intermediateMessages, assistantMessage];
      const finalTitle = 
        (!activeEntry.title || activeEntry.title === 'Untitled Reflection') && geminiRes.suggestedTitle
          ? geminiRes.suggestedTitle
          : activeEntry.title;

      const finalEntry: JournalEntry = {
        ...intermediateEntry,
        title: finalTitle,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      };

      // 2. Guaranteed Transaction Verification: Persist to Firestore
      await saveInteraction(currentUser.uid, finalEntry);

      setActiveEntry(finalEntry);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Interaction or persistence failed:', err);
      setSaveStatus('error');
      setErrorMessage(
        err?.message || 'Failed to complete reflection or save to Firestore. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Retry save manually if previously errored
  const handleRetrySave = async () => {
    if (!currentUser || !activeEntry) return;
    try {
      setSaveStatus('saving');
      setErrorMessage(null);
      await saveInteraction(currentUser.uid, activeEntry);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Retry save failed:', err);
      setSaveStatus('error');
      setErrorMessage('Retry save failed: ' + (err?.message || 'Unknown database error'));
    }
  };

  // Entry deletion handler
  const handleConfirmDelete = async () => {
    if (!currentUser || !entryToDelete) return;
    try {
      setIsDeleting(true);
      await deleteInteraction(currentUser.uid, entryToDelete.id);

      // If active entry was the one deleted, choose another or create blank
      if (activeEntry?.id === entryToDelete.id) {
        const remaining = entries.filter((e) => e.id !== entryToDelete.id);
        if (remaining.length > 0) {
          setActiveEntry(remaining[0]);
        } else {
          setActiveEntry(createBlankEntry(currentUser.uid));
        }
      }
      setEntryToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
      setErrorMessage('Could not delete reflection: ' + (err?.message || 'Permission denied'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div id="auth-loading-screen" className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-neutral-400 tracking-wide">
          Verifying secure credentials...
        </p>
      </div>
    );
  }

  // If user is not authenticated, show welcoming landing page
  if (!currentUser) {
    return <LandingPage />;
  }

  // Active workspace for authenticated user
  const currentWorkingEntry = activeEntry || createBlankEntry(currentUser.uid);

  return (
    <div id="app-root" className="min-h-screen bg-[#050505] flex flex-col antialiased text-[#e0e0e0]">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        onNewEntry={handleNewEntry}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        saveStatus={saveStatus}
        onRetrySave={handleRetrySave}
      />

      {/* Main Container: Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden">
        <SidebarHistory
          entries={entries}
          activeEntryId={currentWorkingEntry.id}
          onSelectEntry={(entry) => {
            setActiveEntry(entry);
            setSaveStatus('idle');
            setErrorMessage(null);
          }}
          onDeleteRequest={(entry) => setEntryToDelete(entry)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#080808]">
          <ActiveJournalView
            key={currentWorkingEntry.id}
            entry={currentWorkingEntry}
            user={currentUser}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            onUpdateTitle={handleUpdateTitle}
            onChangeMode={handleChangeMode}
            error={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        entry={entryToDelete}
        isOpen={Boolean(entryToDelete)}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
