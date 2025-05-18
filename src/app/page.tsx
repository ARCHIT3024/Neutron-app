
"use client";

import React, { useState, useEffect } from 'react';
import type { Note, Tag } from '@/types'; 
import NoteCard from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Moon, Sun } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import NoteEditorDialog from '@/components/NewNoteDialog'; 
import { useTheme } from '@/hooks/use-theme';
import NewNoteTypeDialog from '@/components/NewNoteTypeDialog';
import CanvasNoteDialog from '@/components/CanvasNoteDialog';

const initialNotesData: Note[] = [
  {
    id: '1',
    title: 'Welcome to StickyCanvas!',
    content: 'This is your first note. You can edit me by clicking on my title or content.\n\n**Try this:**\n* Edit me!\n* Pin me!\n* Explore Markdown formatting like **bold** and *italic* text, or create lists.\n* You can also use <u>underline</u> tags.\n* Change my color or add tags via the editor!',
    color: '#FFFACD', 
    tags: [{ id: 'tag1', name: 'Welcome' }],
    isPinned: false,
    imageUrl: 'https://placehold.co/600x400.png', // Example image
    dataAiHint: 'welcome abstract', // Example hint
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    updatedAt: new Date().toISOString(),
    status: 'active',
    archivedAt: null,
    trashedAt: null,
    type: 'text',
  },
  {
    id: '2',
    title: 'Pin Important Notes',
    content: 'Pin important notes to keep them at the top! This note is pinned.\nYou can also add tags and change colors using the editor (click me to open).\n\n- Item 1\n- Item 2: *italic text here*',
    color: '#ADD8E6', 
    tags: [{ id: 'tag2', name: 'Tip' }, {id: 'tag3', name: 'Important'}],
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    archivedAt: null,
    trashedAt: null,
    type: 'text',
  },
  {
    id: '3',
    title: 'AI Summarization & More',
    content: 'Try summarizing a long note with the AI Sparkles icon in the Note Card menu. It helps to get a quick overview. This is particularly useful for notes with a lot of text content that you want to quickly digest.\n\nHere is a longer sentence to test the summarization. The quick brown fox jumps over the lazy dog near the bank of the river. This is a classic pangram used to test typefaces.\n\n**Markdown Examples:**\n* Bullet point 1\n* Bullet point 2\n  * Nested bullet point\n\n1. Numbered list item 1\n2. Numbered list item 2',
    color: '#90EE90', 
    tags: [{ id: 'tag4', name: 'Feature' }, {id: 'tag5', name: 'AI'}],
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    archivedAt: null,
    trashedAt: null,
    type: 'text',
  },
];

export default function HomePage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useSidebar();
  const { toast } = useToast();
  
  const [isTextNoteDialogOpen, setIsTextNoteDialogOpen] = useState(false); 
  const [isCanvasNoteDialogOpen, setIsCanvasNoteDialogOpen] = useState(false);
  const [isNewNoteTypeDialogOpen, setIsNewNoteTypeDialogOpen] = useState(false);
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
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

  const handleOpenNewNoteFlow = () => {
    setEditingNote(null);
    setIsNewNoteTypeDialogOpen(true);
  };

  const handleSelectNoteType = (type: 'text' | 'canvas') => {
    setIsNewNoteTypeDialogOpen(false); 
    if (type === 'text') {
      setIsTextNoteDialogOpen(true);
    } else if (type === 'canvas') {
      setIsCanvasNoteDialogOpen(true);
    }
  };
  
  const handleOpenEditDialog = (note: Note) => {
    setEditingNote(note);
    if (note.type === 'text') {
      setIsTextNoteDialogOpen(true);
    } else if (note.type === 'canvas') {
      setIsCanvasNoteDialogOpen(true);
    }
  };

  const handleSaveTextNote = (noteData: { id?: string; title: string; content: string; color: string; tags: Tag[]; imageUrl?: string; dataAiHint?: string; }) => {
    if (noteData.id) { 
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteData.id 
            ? { 
                ...note, 
                title: noteData.title, 
                content: noteData.content, 
                color: noteData.color, 
                tags: noteData.tags,
                imageUrl: noteData.imageUrl,
                dataAiHint: noteData.dataAiHint,
                updatedAt: new Date().toISOString() 
              } 
            : note
        )
      );
      toast({
        title: "Text Note Updated",
        description: "Your text note has been successfully updated.",
      });
    } else { 
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: noteData.title, 
        content: noteData.content, 
        color: noteData.color, 
        tags: noteData.tags,
        imageUrl: noteData.imageUrl,
        dataAiHint: noteData.dataAiHint,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        archivedAt: null,
        trashedAt: null,
        type: 'text', 
      };
      setAllNotes((prevNotes) => [newNote, ...prevNotes]);
      toast({
        title: "Text Note Created",
        description: "Your new text note has been added.",
      });
    }
    setIsTextNoteDialogOpen(false);
    setEditingNote(null);
  };

  const handleSaveCanvasNote = (noteData: { id?: string; title: string; canvasData: string; color: string; tags: Tag[] }) => {
    if (noteData.id) {
      setAllNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteData.id
            ? { 
                ...note, 
                title: noteData.title, 
                canvasData: noteData.canvasData, 
                color: noteData.color, 
                tags: noteData.tags,
                updatedAt: new Date().toISOString() 
              }
            : note
        )
      );
      toast({
        title: "Canvas Note Updated",
        description: "Your canvas note has been successfully updated.",
      });
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: noteData.title,
        content: '', 
        canvasData: noteData.canvasData,
        color: noteData.color, 
        tags: noteData.tags,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        archivedAt: null,
        trashedAt: null,
        type: 'canvas',
      };
      setAllNotes((prevNotes) => [newNote, ...prevNotes]);
      toast({
        title: "Canvas Note Created",
        description: "Your new canvas note has been added.",
      });
    }
    setIsCanvasNoteDialogOpen(false);
    setEditingNote(null);
  };


  const handleUpdateNoteMeta = (id: string, updates: Partial<Note>) => {
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
        <div className="flex items-center gap-2">
          <Button onClick={toggleTheme} variant="ghost" size="icon" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button onClick={handleOpenNewNoteFlow} size="sm" aria-label="Create a new note">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> New Note
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {sortedActiveNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <StickyNoteIcon className="w-16 h-16 text-muted-foreground mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-semibold mb-2">No active notes yet!</h2>
            <p className="text-muted-foreground mb-4">Click "New Note" to get started or check your archive/trash.</p>
            <Button onClick={handleOpenNewNoteFlow} aria-label="Create your first note">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Create Your First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sortedActiveNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => handleOpenEditDialog(note)}
                onUpdate={handleUpdateNoteMeta} 
                onTrash={handleTrashNote}
                onArchive={handleArchiveNote}
              />
            ))}
          </div>
        )}
      </main>
      
      <NewNoteTypeDialog 
        isOpen={isNewNoteTypeDialogOpen}
        onClose={() => setIsNewNoteTypeDialogOpen(false)}
        onSelectType={handleSelectNoteType}
      />

      <NoteEditorDialog
        isOpen={isTextNoteDialogOpen}
        onClose={() => {
          setIsTextNoteDialogOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveTextNote}
        noteToEdit={editingNote?.type === 'text' ? editingNote : null}
      />

      <CanvasNoteDialog
        isOpen={isCanvasNoteDialogOpen}
        onClose={() => {
          setIsCanvasNoteDialogOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveCanvasNote}
        noteToEdit={editingNote?.type === 'canvas' ? editingNote : null}
      />
    </div>
  );
}

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

