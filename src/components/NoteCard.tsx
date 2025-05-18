
"use client";

import type { Note } from '@/types';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Added Input
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { summarizeNote } from '@/ai/flows/summarize-note';
import { useToast } from '@/hooks/use-toast';
import {
  Pin,
  PinOff,
  Palette,
  Tag as TagIcon,
  ImagePlus,
  Sparkles,
  Trash2,
  MoreVertical,
  Loader2,
  Save,
  Archive,
  ArchiveRestore, 
  RotateCcw, 
  Trash, 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onTrash?: (id: string) => void; 
  onRestore?: (id: string) => void; 
  onDeletePermanently?: (id: string) => void; 
  onArchive?: (id: string) => void; 
  onUnarchive?: (id: string) => void; 
}

const getTextColorForBackground = (bgColor?: string): string => {
  if (!bgColor || !bgColor.startsWith('#')) return 'hsl(var(--card-foreground))';
  try {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
  } catch (e) {
    return 'hsl(var(--card-foreground))'; // Fallback
  }
};


export default function NoteCard({ 
  note, 
  onUpdate, 
  onTrash,
  onRestore,
  onDeletePermanently,
  onArchive,
  onUnarchive,
}: NoteCardProps) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const textColor = getTextColorForBackground(note.color);

  useEffect(() => {
    setTitle(note.title || '');
  }, [note.title]);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleFocus = () => {
    if (note.status === 'active') {
      setIsEditing(true);
    }
  };

  const handleSaveAll = () => {
    if (note.status !== 'active') {
      setIsEditing(false);
      return;
    }

    const updates: Partial<Note> = {};
    let changed = false;

    if (title !== (note.title || '')) {
      updates.title = title;
      changed = true;
    }
    if (content !== note.content) {
      updates.content = content;
      changed = true;
    }

    if (changed) {
      onUpdate(note.id, { ...updates, updatedAt: new Date().toISOString() });
      toast({ title: "Note Saved!", description: "Your changes have been saved." });
    }
    setIsEditing(false);
  };
  
  const handleTogglePin = () => {
    if (note.status !== 'active') return;
    onUpdate(note.id, { isPinned: !note.isPinned, updatedAt: new Date().toISOString() });
     toast({
      title: note.isPinned ? "Note Unpinned" : "Note Pinned",
      description: note.isPinned ? "The note is no longer pinned." : "The note is now pinned to the top.",
    });
  };

  const handleSummarize = async () => {
    if (note.status !== 'active') return;
    const textToSummarize = note.title ? `${note.title}\n\n${note.content}` : note.content;
    if (!textToSummarize.trim()) {
      toast({ title: 'Cannot summarize', description: 'Note content is empty.', variant: 'destructive' });
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await summarizeNote({ noteContent: textToSummarize });
      onUpdate(note.id, { summary: result.summary, updatedAt: new Date().toISOString() });
      toast({
        title: 'Note Summarized!',
        description: <p className="text-sm max-h-20 overflow-y-auto">{result.summary}</p>,
        duration: 7000,
      });
    } catch (error) {
      console.error('Error summarizing note:', error);
      toast({
        title: 'Summarization Failed',
        description: 'Could not summarize the note.',
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const isEditable = note.status === 'active';

  return (
    <Card
      className="flex flex-col h-full shadow-lg hover:shadow-xl transition-transform duration-200 ease-in-out hover:scale-[1.01] focus-within:scale-[1.01] focus-within:shadow-2xl"
      style={{ backgroundColor: note.color, color: textColor }}
      data-testid={`note-card-${note.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4 space-y-0">
        <div className="flex-1 min-w-0 pr-2">
          <Input
            ref={titleInputRef}
            value={title}
            onChange={handleTitleChange}
            onFocus={handleFocus}
            onBlur={handleSaveAll}
            placeholder="Untitled"
            className={`w-full text-xl font-bold border-transparent focus-visible:border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-transparent h-auto p-1 transition-all duration-150 ease-in-out
              ${isEditing && isEditable ? 'ring-primary/70' : 'ring-0 ring-transparent'}`}
            style={{ color: textColor, WebkitBoxShadow: `0 0 0px 1000px ${note.color || 'transparent'} inset` /* Fix for autofill bg color */ }}
            aria-label={`Note title for note ${note.id}`}
            disabled={!isEditable}
          />
        </div>
        <div className="flex items-center space-x-1">
          {note.status === 'active' && ( 
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleTogglePin} 
              className="hover:bg-white/20 focus:bg-white/20 active:scale-90 transform transition-transform duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1" 
              style={{ color: textColor }}
              aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
              aria-pressed={note.isPinned}
            >
              {note.isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-white/20 focus:bg-white/20 active:scale-90 transform transition-transform duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1" 
                style={{ color: textColor }}
                aria-label="More options for this note"
                aria-haspopup="true"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {note.status === 'active' && (
                <>
                  <DropdownMenuItem onSelect={() => alert('Color picker not implemented yet.')} aria-hidden="true">
                    <Palette className="mr-2 h-4 w-4" aria-hidden="true" /> Change Color
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => alert('Tag editing not implemented yet.')} aria-hidden="true">
                    <TagIcon className="mr-2 h-4 w-4" aria-hidden="true" /> Edit Tags
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => alert('Image attachment not implemented yet.')} aria-hidden="true">
                    <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" /> Attach Image
                  </DropdownMenuItem>
                  {onArchive && (
                    <DropdownMenuItem onSelect={() => onArchive(note.id)}>
                      <Archive className="mr-2 h-4 w-4" aria-hidden="true" /> Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={handleSummarize} disabled={isSummarizing || (!note.content.trim() && !note.title?.trim())}>
                    {isSummarizing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    Summarize
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onTrash && (
                    <DropdownMenuItem onSelect={() => onTrash(note.id)}>
                      <Trash className="mr-2 h-4 w-4" aria-hidden="true" /> Move to Trash
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {note.status === 'archived' && (
                <>
                  {onUnarchive && (
                    <DropdownMenuItem onSelect={() => onUnarchive(note.id)}>
                      <ArchiveRestore className="mr-2 h-4 w-4" aria-hidden="true" /> Unarchive
                    </DropdownMenuItem>
                  )}
                  {onTrash && ( 
                    <DropdownMenuItem onSelect={() => onTrash(note.id)}>
                      <Trash className="mr-2 h-4 w-4" aria-hidden="true" /> Move to Trash
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {note.status === 'trashed' && (
                <>
                  {onRestore && (
                    <DropdownMenuItem onSelect={() => onRestore(note.id)}>
                      <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Restore Note
                    </DropdownMenuItem>
                  )}
                  {onDeletePermanently && (
                     <DropdownMenuItem onSelect={() => onDeletePermanently(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Delete Permanently
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1"> {/* pt-0 to reduce space if title is in header */}
        <div 
          className={`relative p-0.5 rounded-md transition-all duration-200 ease-in-out ${isEditing && isEditable ? 'ring-2 ring-primary/70 shadow-md' : 'ring-0 ring-transparent'}`}
        >
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onFocus={handleFocus}
            onBlur={handleSaveAll}
            placeholder="Your note here..."
            className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-[80px] text-sm" // min-h reduced slightly
            style={{ backgroundColor: 'transparent', color: textColor }}
            aria-label={`Note content for note ${note.id}`}
            disabled={!isEditable}
          />
        </div>
        {note.imageUrl && (
          <div className="mt-2 aspect-video relative overflow-hidden rounded-md">
            <Image 
              src={note.imageUrl} 
              alt={note.title || `Attachment for note ${note.id}`}
              layout="fill" 
              objectFit="cover" 
              data-ai-hint={note.dataAiHint || "abstract texture"}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start space-y-2 text-xs" id={`note-meta-${note.id}`}>
        <div className={`transition-all duration-300 ease-in-out ${isEditing && isEditable ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 -translate-y-2 h-0 pointer-events-none overflow-hidden'}`}>
          {isEditing && isEditable && ( 
            <Button size="sm" onClick={handleSaveAll} className="self-start" variant="default" aria-label={`Save changes to note ${note.id}`}>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" /> Save
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {note.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" style={{ backgroundColor: 'rgba(128,128,128,0.2)', color: textColor }} aria-label={`Tag: ${tag.name}`}>
              {tag.name}
            </Badge>
          ))}
        </div>
        {note.summary && (
          <p className="italic opacity-80 text-xs mt-1 w-full">
            <strong>Summary:</strong> {note.summary}
          </p>
        )}
        <p className="opacity-70 self-end text-xs mt-1">
          Updated: <time dateTime={note.updatedAt}>{new Date(note.updatedAt).toLocaleDateString()}</time>
        </p>
         {note.status === 'archived' && note.archivedAt && (
          <p className="opacity-70 self-end text-xs mt-1 text-muted-foreground">
            Archived: <time dateTime={note.archivedAt}>{new Date(note.archivedAt).toLocaleDateString()}</time>
          </p>
        )}
         {note.status === 'trashed' && note.trashedAt && (
          <p className="opacity-70 self-end text-xs mt-1 text-destructive">
            Trashed: <time dateTime={note.trashedAt}>{new Date(note.trashedAt).toLocaleDateString()}</time>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
