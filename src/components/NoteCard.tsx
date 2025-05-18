
"use client";

import type { Note, Tag } from '@/types';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  onDelete: (id: string) => void;
}

// Utility to get contrasting text color (simplified)
const getTextColorForBackground = (bgColor: string): string => {
  if (!bgColor.startsWith('#')) return 'hsl(var(--card-foreground))'; // Default if not a hex
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  // Simple brightness check
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
};


export default function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [content, setContent] = useState(note.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const textColor = getTextColorForBackground(note.color);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleTextareaFocus = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (content !== note.content) { // Only save if content actually changed
      onUpdate(note.id, { content, updatedAt: new Date().toISOString() });
      toast({ title: "Note Saved!", description: "Your changes have been saved." });
    }
    setIsEditing(false);
  };
  
  const handleTogglePin = () => {
    onUpdate(note.id, { isPinned: !note.isPinned, updatedAt: new Date().toISOString() });
     toast({
      title: note.isPinned ? "Note Unpinned" : "Note Pinned",
      description: note.isPinned ? "The note is no longer pinned." : "The note is now pinned to the top.",
    });
  };

  const handleSummarize = async () => {
    if (!note.content.trim()) {
      toast({ title: 'Cannot summarize', description: 'Note content is empty.', variant: 'destructive' });
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await summarizeNote({ noteContent: note.content });
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

  return (
    <Card
      className="flex flex-col h-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
      style={{ backgroundColor: note.color, color: textColor }}
      data-testid={`note-card-${note.id}`}
      aria-labelledby={`note-title-${note.id}`} // Assuming a title might be added later or use content as accessible name part
    >
      <CardHeader className="flex flex-row items-start justify-between p-4">
        {/* Invisible title for accessibility if no visible title exists */}
        <span id={`note-title-${note.id}`} className="sr-only">Note {note.id}</span>
        <div className="flex-1 min-w-0">
          {/* Placeholder for visible title or editable title */}
        </div>
        <div className="flex items-center space-x-1">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-white/20 focus:bg-white/20 active:scale-90 transform transition-transform duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1" 
                style={{ color: textColor }}
                aria-label="More options for this note"
                aria-haspopup="true"
                aria-expanded={undefined} // Radix will manage this
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => alert('Color picker not implemented yet.')}>
                <Palette className="mr-2 h-4 w-4" aria-hidden="true" /> Change Color
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => alert('Tag editing not implemented yet.')}>
                <TagIcon className="mr-2 h-4 w-4" aria-hidden="true" /> Edit Tags
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => alert('Image attachment not implemented yet.')}>
                <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" /> Attach Image
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSummarize} disabled={isSummarizing || !note.content.trim()}>
                {isSummarizing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Summarize
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onDelete(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <div 
          className={`relative p-0.5 rounded-md transition-all duration-200 ease-in-out ${isEditing ? 'ring-2 ring-primary/70 shadow-md' : 'ring-0 ring-transparent'}`}
        >
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onFocus={handleTextareaFocus}
            onBlur={handleSave} // Save on blur
            placeholder="Your note here..."
            className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-[100px] text-sm"
            style={{ backgroundColor: 'transparent', color: textColor }}
            aria-label={`Note content for note ${note.id}`}
            aria-describedby={`note-meta-${note.id}`}
          />
        </div>
        {note.imageUrl && (
          <div className="mt-2 aspect-video relative overflow-hidden rounded-md">
            <Image 
              src={note.imageUrl} 
              alt={`Attachment for note ${note.id}`} // More descriptive alt text
              layout="fill" 
              objectFit="cover" 
              data-ai-hint="abstract texture" 
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start space-y-2 text-xs" id={`note-meta-${note.id}`}>
        <div className={`transition-all duration-300 ease-in-out ${isEditing ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 -translate-y-2 h-0 pointer-events-none overflow-hidden'}`}>
          {isEditing && ( 
            <Button size="sm" onClick={handleSave} className="self-start mt-2" variant="default" aria-label={`Save changes to note ${note.id}`}>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" /> Save
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-auto pt-2">
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
      </CardFooter>
    </Card>
  );
}
