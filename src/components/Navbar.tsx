import React from 'react';
import { 
  Sparkles, 
  Plus, 
  LogOut, 
  Menu, 
  Cloud, 
  CloudCheck, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { UserProfile } from '../types';
import { signOutUser } from '../lib/firebase';

interface NavbarProps {
  user: UserProfile;
  onNewEntry: () => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onRetrySave?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onNewEntry,
  toggleSidebar,
  saveStatus,
  onRetrySave,
}) => {
  return (
    <header id="app-navbar" className="w-full h-16 border-b border-[#1f1f1f] bg-[#080808]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Sidebar toggle & App Branding */}
      <div className="flex items-center gap-3">
        <button
          id="toggle-sidebar-button"
          onClick={toggleSidebar}
          aria-label="Toggle history sidebar"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#171717] transition-colors cursor-pointer lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] text-amber-300 flex items-center justify-center font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-[#f5f5f5]">ReflectAI</span>
            <span className="hidden sm:inline-block ml-2 text-2xs uppercase tracking-wider text-neutral-400 bg-[#121212] px-1.5 py-0.5 rounded border border-[#222222]">
              Private Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Center section: Live sync indicator */}
      <div className="flex items-center gap-2">
        {saveStatus === 'saving' && (
          <div id="sync-status-saving" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-800/60">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Saving to Firestore...</span>
            <span className="sm:hidden">Saving</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div id="sync-status-saved" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Synced to Cloud Firestore</span>
            <span className="sm:hidden">Synced</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div id="sync-status-error" className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium text-rose-400 bg-rose-950/40 border border-rose-800/60">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Save error</span>
            {onRetrySave && (
              <button
                id="retry-save-btn"
                onClick={onRetrySave}
                className="underline hover:text-rose-200 font-semibold cursor-pointer ml-1 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
        )}
        {saveStatus === 'idle' && (
          <div id="sync-status-idle" className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-neutral-400 bg-[#121212] border border-[#222222]">
            <Cloud className="w-3.5 h-3.5 text-neutral-400" />
            <span>Isolated Cloud Session</span>
          </div>
        )}
      </div>

      {/* Right section: New Entry & User Info & Sign Out */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="nav-new-entry-button"
          onClick={onNewEntry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-[#050505] bg-[#f5f5f5] hover:bg-white transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Reflection</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* User Avatar & Info */}
        <div id="user-profile-badge" className="flex items-center gap-2 pl-2 border-l border-[#1f1f1f]">
          {user.photoURL ? (
            <img
              id="user-avatar-image"
              src={user.photoURL}
              alt={user.displayName || 'User profile'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-neutral-700 object-cover"
            />
          ) : (
            <div 
              id="user-avatar-fallback" 
              className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#f5f5f5] font-semibold text-xs flex items-center justify-center border border-[#2a2a2a]"
            >
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
          )}

          <div className="hidden lg:flex flex-col text-left max-w-[130px]">
            <span className="text-xs font-semibold text-[#f5f5f5] truncate">
              {user.displayName || 'Journal User'}
            </span>
            <span className="text-2xs text-neutral-400 truncate">
              {user.email || 'Isolated Account'}
            </span>
          </div>

          <button
            id="nav-signout-button"
            onClick={() => signOutUser()}
            title="Sign out of your account"
            aria-label="Sign out"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
