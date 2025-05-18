
"use client";

import React, { useState, useEffect } from 'react';
import type { Note } from '@/types';
import NoteCard from '@/components/NoteCard';
import { Button } from '@/components/ui/button';
import { Archive as ArchiveIconLucide, Loader2 } from 'lucide-react'; // Renamed to avoid conflict
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

export default function ArchivePage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useSidebar();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedNotes = localStorage.getItem('stickycanvas-notes');
        if (storedNotes) {
          setAllNotes(JSON.parse(storedNotes));
        } else {
          setAllNotes([]); 
        }
      } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
        setAllNotes([]); 
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

  const handleUnarchiveNote = (id: string) => {
    setAllNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, status: 'active', archivedAt: null, updatedAt: new Date().toISOString() } : note
      )
    );
    toast({
      title: "Note Unarchived",
      description: "The note has been moved back to your active notes.",
    });
  };

  const handleMoveToTrashFromArchive = (id: string) => {
    setAllNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, status: 'trashed', trashedAt: new Date().toISOString(), archivedAt: null, updatedAt: new Date().toISOString() } : note
      )
    );
    toast({
      title: "Note Moved to Trash",
      description: "The note has been moved from archive to the trash.",
    });
  };

  // This onUpdate is a placeholder for NoteCard prop, but archiving/unarchiving doesn't directly "update" content.
  // Pinning/content edit is disabled for archived notes in NoteCard.
  const handleUpdateNoteStub = (id: string, updates: Partial<Note>) => {
     setAllNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  const archivedNotes = allNotes
    .filter(note => note.status === 'archived')
    .sort((a, b) => new Date(b.archivedAt || 0).getTime() - new Date(a.archivedAt || 0).getTime());


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full flex-1 p-4" role="status" aria-live="polite">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true"/>
        <p className="ml-4 text-xl mt-4">Loading archive...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger aria-label="Toggle sidebar" />}
          <h1 className="text-2xl font-semibold">Archived Notes</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {archivedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <ArchiveIconLucide className="w-24 h-24 text-muted-foreground mb-6" aria-hidden="true" />
            <h2 className="text-3xl font-semibold mb-3">Archive Is Empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Notes you archive will appear here. You can unarchive them or move them to trash.
            </p>
            <Button asChild>
              <Link href="/">Back to Notes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {archivedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdateNoteStub} // Content/pin updates disabled for archived notes in NoteCard
                onUnarchive={handleUnarchiveNote}
                onTrash={handleMoveToTrashFromArchive}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
