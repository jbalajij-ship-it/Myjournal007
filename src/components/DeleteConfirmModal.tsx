import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { JournalEntry } from '../types';

interface DeleteConfirmModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  entry,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !entry) return null;

  return (
    <div 
      id="delete-modal-overlay" 
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div 
        id="delete-modal-card" 
        className="w-full max-w-md bg-[#0f0f0f] rounded-2xl p-6 shadow-2xl border border-[#262626] animate-in fade-in zoom-in duration-150"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-950/50 text-red-400 flex items-center justify-center shrink-0 border border-red-900/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            id="close-delete-modal-btn"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Cancel deletion"
            className="p-1 text-neutral-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-[#f5f5f5]">Delete reflection?</h3>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-neutral-200">"{entry.title || 'Untitled Reflection'}"</span>? 
            This document will be permanently removed from your isolated Cloud Firestore collection. This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-neutral-300 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Delete Forever</span>
          </button>
        </div>
      </div>
    </div>
  );
};
