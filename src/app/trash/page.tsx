
"use client";

import React, { useState, useEffect } from 'react';
import type { Note } from '@/types';
import NoteCard from '@/components/NoteCard';
import { Button, buttonVariants } from '@/components/ui/button'; // Added buttonVariants import
import { Trash2 as Trash2IconLucide, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TrashPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useSidebar();
  const { toast } = useToast();
  const [noteToDeletePermanently, setNoteToDeletePermanently] = useState<string | null>(null);


  useEffect(() => {
    // Load notes from localStorage
    try {
      const storedNotes = localStorage.getItem('stickycanvas-notes');
      if (storedNotes) {
        setAllNotes(JSON.parse(storedNotes));
      } else {
        setAllNotes([]); // No initial data if localStorage is empty for trash
      }
    } catch (error) {
      console.error("Failed to parse notes from localStorage", error);
      setAllNotes([]); 
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

  const handleRestoreNote = (id: string) => {
    setAllNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, status: 'active', trashedAt: null, updatedAt: new Date().toISOString() } : note
      )
    );
    toast({
      title: "Note Restored",
      description: "The note has been moved back to your active notes.",
    });
  };

  const confirmDeletePermanently = (id: string) => {
    setAllNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    toast({
      title: "Note Deleted Permanently",
      description: "The note has been permanently removed.",
      variant: "destructive"
    });
    setNoteToDeletePermanently(null);
  };
  
  const trashedNotes = allNotes
    .filter(note => note.status === 'trashed')
    .sort((a, b) => new Date(b.trashedAt || 0).getTime() - new Date(a.trashedAt || 0).getTime());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full flex-1 p-4" role="status" aria-live="polite">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true"/>
        <p className="ml-4 text-xl mt-4">Loading trash...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger aria-label="Toggle sidebar" />}
          <h1 className="text-2xl font-semibold">Trash</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {trashedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <Trash2IconLucide className="w-24 h-24 text-muted-foreground mb-6" aria-hidden="true" />
            <h2 className="text-3xl font-semibold mb-3">Trash Is Empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Deleted notes will appear here. You can restore them or delete them permanently.
            </p>
            <Button asChild>
              <Link href="/">Back to Notes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {trashedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => { /* Editing disabled for trashed notes */ }}
                onUpdate={(id, updates) => { /* Updates are disabled for trashed notes via UI, but handler needed */
                   setAllNotes(prev => prev.map(n => n.id === id ? {...n, ...updates, updatedAt: new Date().toISOString()} : n));
                }}
                onRestore={handleRestoreNote}
                onDeletePermanently={() => setNoteToDeletePermanently(note.id)}
              />
            ))}
          </div>
        )}
      </main>
       <AlertDialog open={!!noteToDeletePermanently} onOpenChange={(open) => !open && setNoteToDeletePermanently(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDeletePermanently(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => noteToDeletePermanently && confirmDeletePermanently(noteToDeletePermanently)}
              className={buttonVariants({variant: "destructive"})}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

