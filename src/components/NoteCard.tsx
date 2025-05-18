"use client";

import type { Note, Tag } from '@/types';
import React, { useState, useEffect } from 'react';
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

  const textColor = getTextColorForBackground(note.color);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isEditing) setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(note.id, { content, updatedAt: new Date().toISOString() });
    setIsEditing(false);
    toast({ title: "Note Saved!", description: "Your changes have been saved." });
  };
  
  const handleTogglePin = () => {
    onUpdate(note.id, { isPinned: !note.isPinned, updatedAt: new Date().toISOString() });
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
        description: <p className="text-sm">{result.summary}</p>,
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
      className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300"
      style={{ backgroundColor: note.color, color: textColor }}
    >
      <CardHeader className="flex flex-row items-start justify-between p-4">
        <div className="flex-1 min-w-0">
          {/* Placeholder for title or editable title */}
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={handleTogglePin} className="hover:bg-white/20 focus:bg-white/20" style={{ color: textColor }}>
            {note.isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
            <span className="sr-only">{note.isPinned ? 'Unpin' : 'Pin'} note</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/20 focus:bg-white/20" style={{ color: textColor }}>
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Note options</span>
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
              <DropdownMenuItem onClick={handleSummarize} disabled={isSummarizing}>
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
        <Textarea
          value={content}
          onChange={handleContentChange}
          onBlur={handleSave}
          placeholder="Your note here..."
          className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[100px] text-sm"
          style={{ backgroundColor: 'transparent', color: textColor, borderColor: 'rgba(128,128,128,0.3)' }}
        />
        {note.imageUrl && (
          <div className="mt-2 aspect-video relative overflow-hidden rounded-md">
            <Image src={note.imageUrl} alt="Note attachment" layout="fill" objectFit="cover" data-ai-hint="abstract texture" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start space-y-2 text-xs">
        {isEditing && (
            <Button size="sm" onClick={handleSave} className="self-start mt-2" variant="default">
                <Save className="mr-2 h-4 w-4" /> Save
            </Button>
        )}
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" style={{ backgroundColor: 'rgba(128,128,128,0.2)', color: textColor }}>
              {tag.name}
            </Badge>
          ))}
        </div>
        {note.summary && (
          <p className="italic opacity-80">
            <strong>Summary:</strong> {note.summary}
          </p>
        )}
        <p className="opacity-70 self-end">
          Updated: {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}
