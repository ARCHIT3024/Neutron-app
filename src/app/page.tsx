
"use client";

import React, { useState, useEffect } from 'react';
import type { Note, Tag } from '@/types'; // Ensure Tag is imported
import NoteCard from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import NewNoteDialog from '@/components/NewNoteDialog';

const initialNotesData: Note[] = [
  {
    id: '1',
    title: 'Welcome to StickyCanvas!',
    content: 'This is your first note. Click the title or content to edit, or use the menu for more options.\n\n**Try this:**\n* Edit me!\n* Pin me!',
    color: '#FFFACD', // LemonChiffon
    tags: [{ id: 'tag1', name: 'Welcome' }],
    isPinned: false,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'welcome abstract',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
    status: 'active',
    archivedAt: null,
    trashedAt: null,
  },
  {
    id: '2',
    title: 'Pin Important Notes',
    content: 'Pin important notes to keep them at the top! This note is pinned.\nYou can also add tags and change colors.',
    color: '#ADD8E6', // LightBlue
    tags: [{ id: 'tag2', name: 'Tip' }, {id: 'tag3', name: 'Important'}],
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    archivedAt: null,
    trashedAt: null,
  },
  {
    id: '3',
    title: 'AI Summarization Tip',
    content: 'Try summarizing a long note with the AI Sparkles icon in the menu. It helps to get a quick overview. This is particularly useful for notes with a lot of text content that you want to quickly digest.',
    color: '#90EE90', // LightGreen
    tags: [{ id: 'tag4', name: 'Feature' }, {id: 'tag5', name: 'AI'}],
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    archivedAt: null,
    trashedAt: null,
  },
];

export default function HomePage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useSidebar();
  const { toast } = useToast();
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedNotes = localStorage.getItem('stickycanvas-notes');
        if (storedNotes) {
          setAllNotes(JSON.parse(storedNotes));
        } else {
          setAllNotes(initialNotesData);
        }
      } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
        setAllNotes(initialNotesData);
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem('stickycanvas-notes', JSON.stringify(allNotes));
        } catch (error) {
            console.error("Failed to save notes to localStorage", error);
        }
    }
  }, [allNotes, isLoading]);


  const handleOpenNewNoteDialog = () => {
    setIsNewNoteDialogOpen(true);
  };

  const handleSaveNewNote = (title: string, content: string, color: string, tags: Tag[]) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title, 
      content: content, 
      color: color, 
      tags: tags,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      archivedAt: null,
      trashedAt: null,
    };
    setAllNotes((prevNotes) => [newNote, ...prevNotes]);
    toast({
      title: "Note Created",
      description: "Your new note has been added to the board.",
    });
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setAllNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  const handleTrashNote = (id: string) => {
    setAllNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, status: 'trashed', trashedAt: new Date().toISOString(), archivedAt: null, updatedAt: new Date().toISOString() } : note
      )
    );
    toast({
      title: "Note Moved to Trash",
      description: "The note has been moved to the trash.",
    });
  };

  const handleArchiveNote = (id: string) => {
    setAllNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, status: 'archived', archivedAt: new Date().toISOString(), trashedAt: null, updatedAt: new Date().toISOString() } : note
      )
    );
    toast({
      title: "Note Archived",
      description: "The note has been moved to the archive.",
    });
  };

  const activeNotes = allNotes.filter(note => note.status === 'active');
  const pinnedNotes = activeNotes.filter(note => note.isPinned).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const unpinnedNotes = activeNotes.filter(note => !note.isPinned).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedActiveNotes = [...pinnedNotes, ...unpinnedNotes];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full flex-1 p-4" role="status" aria-live="polite">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <p className="ml-4 text-xl mt-4">Loading your canvas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger aria-label="Toggle sidebar" />}
          <h1 className="text-2xl font-semibold">My Notes</h1>
        </div>
        <Button onClick={handleOpenNewNoteDialog} size="sm" aria-label="Create a new note">
          <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> New Note
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {sortedActiveNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <StickyNoteIcon className="w-16 h-16 text-muted-foreground mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-semibold mb-2">No active notes yet!</h2>
            <p className="text-muted-foreground mb-4">Click "New Note" to get started or check your archive/trash.</p>
            <Button onClick={handleOpenNewNoteDialog} aria-label="Create your first note">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Create Your First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sortedActiveNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdateNote}
                onTrash={handleTrashNote}
                onArchive={handleArchiveNote}
              />
            ))}
          </div>
        )}
      </main>
      <NewNoteDialog
        isOpen={isNewNoteDialogOpen}
        onClose={() => setIsNewNoteDialogOpen(false)}
        onSave={handleSaveNewNote}
      />
    </div>
  );
}

// Simple StickyNote Icon for empty state
const StickyNoteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
    <path d="M15 3v6h6" />
  </svg>
);

    