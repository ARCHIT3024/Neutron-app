
"use client";

import React, { useState, useEffect } from 'react';
import type { Note } from '@/types';
import NoteCard from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const initialNotesData: Note[] = [
  {
    id: '1',
    content: 'Welcome to StickyCanvas! This is your first note. Click to edit, or use the menu for more options.',
    color: '#FFFACD', // LemonChiffon
    tags: [{ id: 'tag1', name: 'Welcome' }],
    isPinned: false,
    imageUrl: 'https://placehold.co/600x400.png', 
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    content: 'Pin important notes to keep them at the top! This note is pinned.',
    color: '#ADD8E6', // LightBlue
    tags: [{ id: 'tag2', name: 'Tip' }, {id: 'tag3', name: 'Important'}],
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    content: 'Try summarizing a long note with the AI Sparkles icon in the menu. It helps to get a quick overview.',
    color: '#90EE90', // LightGreen
    tags: [{ id: 'tag4', name: 'Feature' }],
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useSidebar(); 

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedNotes = localStorage.getItem('stickycanvas-notes');
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        } else {
          setNotes(initialNotesData);
        }
      } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
        setNotes(initialNotesData); 
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer); 
  }, []);
  
  useEffect(() => {
    if (!isLoading) { 
        try {
            localStorage.setItem('stickycanvas-notes', JSON.stringify(notes));
        } catch (error) {
            console.error("Failed to save notes to localStorage", error);
        }
    }
  }, [notes, isLoading]);


  const handleAddNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(), 
      content: 'New Note! Click to edit...',
      color: '#FFFFFF', 
      tags: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full flex-1 p-4" role="status" aria-live="polite">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <p className="ml-4 text-xl mt-4">Loading your canvas...</p>
      </div>
    );
  }
  
  const pinnedNotes = notes.filter(note => note.isPinned).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.createdAt).getTime()); 
  const unpinnedNotes = notes.filter(note => !note.isPinned).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); 
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger aria-label="Toggle sidebar" />} 
          <h1 className="text-2xl font-semibold">My Notes</h1>
        </div>
        <Button onClick={handleAddNote} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> New Note
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <StickyNoteIcon className="w-16 h-16 text-muted-foreground mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-semibold mb-2">No notes yet!</h2>
            <p className="text-muted-foreground mb-4">Click "New Note" to get started.</p>
            <Button onClick={handleAddNote}>
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Create Your First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </main>
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
    aria-hidden="true" // Added for decorative icon
    {...props}
  >
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
    <path d="M15 3v6h6" />
  </svg>
);
