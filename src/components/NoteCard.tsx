
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
    >
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex-1 min-w-0">
          {/* Placeholder for title or editable title */}
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleTogglePin} 
            className="hover:bg-white/20 focus:bg-white/20 active:scale-90 transform transition-transform duration-150" 
            style={{ color: textColor }}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            {note.isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-white/20 focus:bg-white/20 active:scale-90 transform transition-transform duration-150" 
                style={{ color: textColor }}
                aria-label="Note options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => alert('Color picker not implemented yet.')}>
                <Palette className="mr-2 h-4 w-4" /> Change Color
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Tag editing not implemented yet.')}>
                <TagIcon className="mr-2 h-4 w-4" /> Edit Tags
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('Image attachment not implemented yet.')}>
                <ImagePlus className="mr-2 h-4 w-4" /> Attach Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSummarize} disabled={isSummarizing || !note.content.trim()}>
                {isSummarizing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Summarize
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Note
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
            onBlur={handleSave}
            placeholder="Your note here..."
            className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-[100px] text-sm"
            style={{ backgroundColor: 'transparent', color: textColor }}
            aria-label="Note content"
          />
        </div>
        {note.imageUrl && (
          <div className="mt-2 aspect-video relative overflow-hidden rounded-md">
            <Image src={note.imageUrl} alt="Note attachment" layout="fill" objectFit="cover" data-ai-hint="abstract texture" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start space-y-2 text-xs">
        <div className={`transition-all duration-300 ease-in-out ${isEditing ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 -translate-y-2 h-0 pointer-events-none overflow-hidden'}`}>
          {isEditing && ( // Keep this conditional render for the button itself to ensure it's in DOM only when needed for transitions
            <Button size="sm" onClick={handleSave} className="self-start mt-2" variant="default" aria-label="Save note">
                <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-auto pt-2"> {/* Ensure tags are pushed down if save button is not there */}
          {note.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" style={{ backgroundColor: 'rgba(128,128,128,0.2)', color: textColor }}>
              {tag.name}
            </Badge>
          ))}
        </div>
        {note.summary && (
          <p className="italic opacity-80 text-xs mt-1 w-full"> {/* Ensure summary also takes full width if needed */}
            <strong>Summary:</strong> {note.summary}
          </p>
        )}
        <p className="opacity-70 self-end text-xs mt-1"> {/* Ensure date is always at bottom right */}
          Updated: {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}
