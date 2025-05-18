
"use client";

import type { Note } from '@/types';
import React, { useState } from 'react'; 
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
  Archive as ArchiveIconLucide, // Renamed to avoid conflict
  ArchiveRestore, 
  RotateCcw, 
  Trash,
  Edit3 
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
  onEdit: (id: string) => void; 
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
    return 'hsl(var(--card-foreground))'; 
  }
};


export default function NoteCard({ 
  note, 
  onEdit,
  onUpdate, 
  onTrash,
  onRestore,
  onDeletePermanently,
  onArchive,
  onUnarchive,
}: NoteCardProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  
  const textColor = getTextColorForBackground(note.color);

  const handleEditClick = () => {
    if (note.status === 'active') {
      onEdit(note.id);
    }
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
    if (note.status !== 'active' || note.type === 'canvas') return;
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

  const handleAttachImage = () => {
    if (note.status !== 'active' || note.type === 'canvas') return;
    const currentUrl = note.imageUrl || "https://placehold.co/600x400.png";
    const newImageUrl = window.prompt("Enter image URL:", currentUrl);
    if (newImageUrl !== null) { // User didn't cancel
      let newHint = note.dataAiHint;
      if (newImageUrl && !newImageUrl.startsWith('https://placehold.co')) {
        newHint = 'user image';
      } else if (newImageUrl && newImageUrl.startsWith('https://placehold.co') && (!newHint || newHint === 'user image')) {
        newHint = 'abstract texture'; // Default for placeholders
      } else if (!newImageUrl) {
          newHint = ''; // Clear hint if URL is cleared
      }
      onUpdate(note.id, { imageUrl: newImageUrl || undefined, dataAiHint: newHint, updatedAt: new Date().toISOString() });
      toast({
        title: newImageUrl ? "Image URL Updated" : "Image URL Removed",
        description: newImageUrl ? "The note's image has been updated." : "The note's image has been removed.",
      });
    }
  };

  const isViewOnly = note.status !== 'active';

  const renderTextContent = (markdown: string) => {
    if (!markdown) return null;
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
      .replace(/\*(.*?)\*/g, '<em>$1</em>')         
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')       // Handle <u> tags
      .replace(/(\r\n|\r|\n){2,}/g, '</p><p>')        
      .replace(/(\r\n|\r|\n)/g, '<br />');             
      
    html = html.replace(/^(\*|-) (.*?)(?=<br \/>|$)/gm, (match, bullet, item) => `<li>${item.trim()}</li>`);
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$1</ul>'); 
    html = html.replace(/<li>(.*?)<br \/>(.*?)<\/li>/g, '<li>$1$2</li>');
    if (!html.startsWith('<p>') && !html.startsWith('<ul>')) {
      html = `<p>${html}</p>`;
    }
    html = html.replace(/<\/p><p>/g, '</p><p class="mt-2">'); 
    html = html.replace(/<\/ul><p>/g, '</ul><p class="mt-2">'); 
    html = html.replace(/<\/ul><br \/><p>/g, '</ul><p class="mt-2">');

    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose prose-sm max-w-none" style={{color: textColor}} />;
  };


  return (
    <Card
      className={`flex flex-col h-full shadow-lg transition-transform duration-200 ease-in-out 
                  ${!isViewOnly ? 'hover:shadow-xl hover:scale-[1.01] focus-within:scale-[1.01] focus-within:shadow-2xl cursor-pointer' : 'opacity-90'}`}
      style={{ backgroundColor: note.color, color: textColor }}
      data-testid={`note-card-${note.id}`}
      onClick={!isViewOnly ? handleEditClick : undefined}
      onKeyDown={!isViewOnly ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEditClick(); } } : undefined}
      tabIndex={!isViewOnly ? 0 : -1}
      role={!isViewOnly ? "button" : undefined}
      aria-label={isViewOnly ? `Note: ${note.title || 'Untitled'}. This note is ${note.status}.` : `Edit note: ${note.title || 'Untitled'}`}
    >
      <CardHeader 
        className="flex flex-row items-start justify-between p-4 space-y-0"
        onClick={(e) => { if ((e.target as HTMLElement).closest('button')) e.stopPropagation();}} 
      >
        <div 
          className="flex-1 min-w-0 pr-2"
        >
          <h3 
            className="text-xl font-bold truncate" 
            style={{ color: textColor }}
            aria-label={`Note title: ${note.title || 'Untitled'}`} // More direct label
            id={`note-title-${note.id}`}
          >
            {note.title || 'Untitled'} {note.type === 'canvas' && <span className="text-xs font-normal opacity-70">(Canvas)</span>}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          {note.status === 'active' && ( 
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); handleTogglePin(); }}
              className="hover:bg-white/20 focus:bg-white/20 active:scale-90 transform transition-transform duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1" 
              style={{ color: textColor }}
              aria-label={note.isPinned ? `Unpin note titled ${note.title || 'Untitled'}` : `Pin note titled ${note.title || 'Untitled'}`}
              aria-pressed={note.isPinned}
              tabIndex={0}
            >
              {note.isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => e.stopPropagation()} 
                className="hover:bg-white/20 focus:bg-white/20 active:scale-90 transform transition-transform duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1" 
                style={{ color: textColor }}
                aria-label={`More options for note titled ${note.title || 'Untitled'}`}
                aria-haspopup="true"
                tabIndex={0}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              onClick={(e) => e.stopPropagation()} 
              aria-labelledby={`note-title-${note.id}`}
            >
              {note.status === 'active' && (
                <>
                  <DropdownMenuItem onSelect={handleEditClick}>
                    <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" /> Edit Note
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => alert('Color picker from card menu not implemented yet. Edit the note to change color.')} disabled>
                    <Palette className="mr-2 h-4 w-4" aria-hidden="true" /> Change Color
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => alert('Tag editing from card menu not implemented yet. Edit the note to change tags.')} disabled>
                    <TagIcon className="mr-2 h-4 w-4" aria-hidden="true" /> Edit Tags
                  </DropdownMenuItem>
                  {note.type === 'text' && (
                    <DropdownMenuItem onSelect={handleAttachImage}>
                      <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" /> Attach Image
                    </DropdownMenuItem>
                  )}
                  {onArchive && (
                    <DropdownMenuItem onSelect={() => onArchive(note.id)}>
                      <ArchiveIconLucide className="mr-2 h-4 w-4" aria-hidden="true" /> Archive
                    </DropdownMenuItem>
                  )}
                  {note.type === 'text' && (
                    <DropdownMenuItem onSelect={handleSummarize} disabled={isSummarizing || (!note.content.trim() && !note.title?.trim())}>
                      {isSummarizing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      Summarize
                    </DropdownMenuItem>
                  )}
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
      <CardContent 
        className="p-4 pt-0 flex-1 overflow-hidden"
        aria-labelledby={`note-title-${note.id}`}
      >
        {note.type === 'text' && (
          <>
            <div className="text-sm leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
              {renderTextContent(note.content)}
            </div>
            {note.imageUrl && (
              <div className="mt-2 aspect-video relative overflow-hidden rounded-md">
                <Image 
                  src={note.imageUrl} 
                  alt={note.title ? `Image for note titled ${note.title}` : `Image for note ${note.id}`}
                  fill={true} 
                  style={{objectFit:"cover"}} 
                  data-ai-hint={note.dataAiHint || "abstract texture"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={note.isPinned}
                />
              </div>
            )}
          </>
        )}
        {note.type === 'canvas' && note.canvasData && (
           <div className="mt-2 aspect-video relative overflow-hidden rounded-md border bg-slate-50"> 
            <Image 
              src={note.canvasData} 
              alt={note.title ? `Canvas drawing for note titled ${note.title}` : `Canvas drawing for note ${note.id}`}
              fill={true} 
              style={{objectFit:"contain"}} 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={note.isPinned}
              data-ai-hint="drawing sketch"
            />
          </div>
        )}
      </CardContent>
      <CardFooter 
        className="p-4 flex flex-col items-start space-y-2 text-xs" 
        id={`note-meta-${note.id}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {note.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" style={{ backgroundColor: 'rgba(128,128,128,0.2)', color: textColor }} aria-label={`Tag: ${tag.name}`}>
              {tag.name}
            </Badge>
          ))}
        </div>
        {note.type === 'text' && note.summary && (
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

