
"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Palette, Tags as TagsIconLucide, BoldIcon, UnderlineIcon, ListIcon, Check, ImagePlus as ImagePlusIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Note, Tag } from '@/types';
import { useTheme } from '@/hooks/use-theme'; 

interface NoteEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { id?: string; title: string; content: string; color: string; tags: Tag[]; imageUrl?: string; dataAiHint?: string; }) => void;
  noteToEdit?: Note | null;
}

const PRESET_COLORS_MAP: Record<string, string> = {
  '#FFFFFF': 'White',
  '#FFFACD': 'Lemon Chiffon',
  '#ADD8E6': 'Light Blue',
  '#90EE90': 'Light Green',
  '#FFB6C1': 'Light Pink',
  '#FFDAB9': 'Peach',
  '#E6E6FA': 'Lavender',
};
const PRESET_COLORS = Object.keys(PRESET_COLORS_MAP);

// Helper to determine if text color should be light or dark based on background
const getTextColorForBackground = (bgColor?: string): string => {
  if (!bgColor || !bgColor.startsWith('#') || bgColor.length < 7) return 'hsl(var(--card-foreground))'; 
  try {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5 ? '#000000' : '#FFFFFF'; 
  } catch (e) {
    return 'hsl(var(--card-foreground))'; 
  }
};

const NoteEditorDialog: FC<NoteEditorDialogProps> = ({ isOpen, onClose, onSave, noteToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);
  const [tagsString, setTagsString] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [dataAiHint, setDataAiHint] = useState<string>('');
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { theme } = useTheme(); 
  const mainDialogTextColor = getTextColorForBackground(selectedColor);

  let toolbarIconColor = mainDialogTextColor;
  if (theme === 'dark' && mainDialogTextColor === '#000000') {
    toolbarIconColor = 'hsl(var(--foreground))';
  }


  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        setTitle(noteToEdit.title || '');
        setContent(noteToEdit.content);
        setSelectedColor(noteToEdit.color || PRESET_COLORS[0]);
        setTagsString(noteToEdit.tags?.map(tag => tag.name).join(', ') || '');
        setImageUrl(noteToEdit.imageUrl || '');
        setDataAiHint(noteToEdit.dataAiHint || '');
        setTimeout(() => {
            contentTextareaRef.current?.focus();
            if (contentTextareaRef.current) {
             contentTextareaRef.current.setSelectionRange(contentTextareaRef.current.value.length, contentTextareaRef.current.value.length);
            }
        }, 100);
      } else {
        setTitle('');
        setContent('');
        setSelectedColor(PRESET_COLORS[0]);
        setTagsString('');
        setImageUrl('');
        setDataAiHint('');
        setTimeout(() => {
            titleInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, noteToEdit]);

  const handleSave = () => {
    const parsedTags: Tag[] = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tagName => tagName !== '')
      .map(tagName => ({ id: crypto.randomUUID(), name: tagName }));
    
    let finalDataAiHint = dataAiHint;
    if (imageUrl && !imageUrl.startsWith('https://placehold.co') && !finalDataAiHint) {
        finalDataAiHint = 'user image';
    } else if (imageUrl && imageUrl.startsWith('https://placehold.co') && !finalDataAiHint) {
        finalDataAiHint = 'abstract texture'; // Default for placeholders if not set
    }


    onSave({
      id: noteToEdit?.id,
      title,
      content,
      color: selectedColor,
      tags: parsedTags,
      imageUrl,
      dataAiHint: finalDataAiHint,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(); 
    }
  };

  const handleFormatAction = (type: 'bold' | 'list' | 'underline') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = content.substring(selectionStart, selectionEnd);
    let newContent = content;
    let cursorPosition = selectionStart;

    const insertText = (textToInsert: string, cursorPosOffset: number) => {
        newContent = `${content.substring(0, selectionStart)}${textToInsert}${content.substring(selectionEnd)}`;
        cursorPosition = selectionStart + cursorPosOffset;
    };
    
    const wrapText = (prefix: string, suffix: string) => {
        newContent = `${content.substring(0, selectionStart)}${prefix}${selectedText}${suffix}${content.substring(selectionEnd)}`;
        cursorPosition = selectionStart + prefix.length + (selectedText ? selectedText.length : 0) + suffix.length;
    };
    
    const wrapOrInsert = (prefix: string, suffix: string, insertOnlyPrefix?: string, insertOnlySuffix?: string, insertCursorOffset?: number) => {
      if (selectedText) {
        wrapText(prefix, suffix);
      } else {
        const textToInsert = `${insertOnlyPrefix || prefix}${insertOnlySuffix || suffix}`;
        const finalCursorOffset = insertCursorOffset !== undefined ? insertCursorOffset : (insertOnlyPrefix || prefix).length;
        insertText(textToInsert, finalCursorOffset);
      }
    };


    switch (type) {
      case 'bold':
        wrapOrInsert('**', '**', '****', '', 2);
        break;
      case 'list':
        if (selectedText) {
          const lines = selectedText.split('\n');
          const listifiedLines = lines.map(line => `* ${line}`).join('\n');
          newContent = `${content.substring(0, selectionStart)}${listifiedLines}${content.substring(selectionEnd)}`;
          cursorPosition = selectionEnd + (lines.length * 2); 
        } else {
          const currentLineStart = content.lastIndexOf('\n', selectionStart -1) + 1;
          const prefix = (currentLineStart === 0 || content.charAt(currentLineStart-1) === '\n') && selectionStart !== 0 ? '' : '\n';
          insertText(`${prefix}* `, prefix.length + 2); 
        }
        break;
      case 'underline':
         wrapOrInsert('<u>', '</u>', '<u></u>', '', 3);
        break;
    }
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const handleImageAction = () => {
    const currentUrl = imageUrl || "https://placehold.co/600x400.png";
    const newUrl = window.prompt("Enter image URL:", currentUrl);
    if (newUrl !== null) { // User didn't cancel prompt
      setImageUrl(newUrl);
      if (newUrl && !newUrl.startsWith('https://placehold.co')) {
        setDataAiHint('user image'); // Default hint for non-placeholders
      } else if (newUrl && newUrl.startsWith('https://placehold.co') && (!dataAiHint || dataAiHint === 'user image')) {
        setDataAiHint('abstract texture'); // Default for placeholders
      } else if (!newUrl) {
        setDataAiHint(''); // Clear hint if URL is cleared
      }
    }
  };

  const dialogAccessibleTitle = noteToEdit ? 'Edit Note' : 'Create New Note';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[580px] bg-card shadow-xl rounded-lg max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: selectedColor, transition: 'background-color 0.3s ease', color: mainDialogTextColor }}
        onPointerDownOutside={(e) => {
          if ((e.target as HTMLElement)?.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
        aria-label={dialogAccessibleTitle}
      >
        <DialogHeader className="sticky top-0 bg-inherit z-10 pt-6 -mt-6 px-6 -mx-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold" style={{ color: mainDialogTextColor }}>
            {dialogAccessibleTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 px-0.5"> {/* Added px-0.5 for slight scrollbar padding if content scrolls */}
          <div className="grid gap-2">
            <Label htmlFor="note-title" className="text-sm font-medium" style={{ color: mainDialogTextColor === '#000000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}}>
              Title
            </Label>
            <Input
              ref={titleInputRef}
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-base bg-background/80 border-input focus:ring-primary focus:border-primary rounded-md p-3 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note-content" className="text-sm font-medium" style={{ color: mainDialogTextColor === '#000000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}}>
              Content (Markdown and &lt;u&gt;underline&lt;/u&gt; supported)
            </Label>
            <Textarea
              ref={contentTextareaRef}
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your note here... Use **bold**, *italic*, <u>underline</u>, or * for lists."
              className="min-h-[150px] text-sm bg-background/80 border-input focus:ring-primary focus:border-primary rounded-md p-3 text-foreground placeholder:text-muted-foreground"
              aria-label="Note content"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note-tags" className="text-sm font-medium" style={{ color: mainDialogTextColor === '#000000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}}>
              Tags (comma-separated)
            </Label>
            <Input
              id="note-tags"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="e.g., work, important, idea"
              className="text-sm bg-background/80 border-input focus:ring-primary focus:border-primary rounded-md p-3 text-foreground placeholder:text-muted-foreground"
            />
          </div>
           {/* Display current image URL if one exists, and allow editing data-ai-hint for placeholders */}
           {imageUrl && (
            <div className="grid gap-2">
                <Label htmlFor="note-image-url-display" className="text-sm font-medium" style={{ color: mainDialogTextColor === '#000000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}}>
                Current Image URL
                </Label>
                <p id="note-image-url-display" className="text-xs truncate p-2 rounded-md bg-background/50" style={{ color: mainDialogTextColor === '#000000' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'}}>{imageUrl}</p>
            </div>
            )}
           {imageUrl && imageUrl.startsWith('https://placehold.co') && (
             <div className="grid gap-2">
                <Label htmlFor="note-image-hint" className="text-sm font-medium" style={{ color: mainDialogTextColor === '#000000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}}>
                  Placeholder Image Hint (1-2 words)
                </Label>
                <Input
                  id="note-image-hint"
                  value={dataAiHint}
                  onChange={(e) => setDataAiHint(e.target.value.split(' ').slice(0,2).join(' '))}
                  placeholder="e.g. office desk"
                  className="text-sm bg-background/80 border-input focus:ring-primary focus:border-primary rounded-md p-3 text-foreground placeholder:text-muted-foreground"
                />
            </div>
           )}
          
          <Separator className="my-2 bg-border/50" />

          <div className="flex items-center justify-start space-x-2 px-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  aria-label="Change note color"
                  className="h-8 w-8"
                  style={{ color: toolbarIconColor }}
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-card border-border shadow-lg rounded-md">
                <div className="flex gap-1">
                  {PRESET_COLORS.map(color => (
                    <Button
                      key={color}
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full p-0 border-2"
                      style={{ backgroundColor: color, borderColor: selectedColor === color ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Set color to ${PRESET_COLORS_MAP[color] || color}`}
                    >
                      {selectedColor === color && <Check className="h-4 w-4" style={{ color: getTextColorForBackground(color) }}/>}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => document.getElementById('note-tags')?.focus()}
              aria-label="Edit tags"
              className="h-8 w-8"
               style={{ color: toolbarIconColor }}
            >
              <TagsIconLucide className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-2 bg-border/50" />

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFormatAction('bold')}
              aria-label="Bold text"
              className="h-8 w-8"
               style={{ color: toolbarIconColor }}
            >
              <BoldIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFormatAction('underline')}
              aria-label="Underline text"
              className="h-8 w-8"
               style={{ color: toolbarIconColor }}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFormatAction('list')}
              aria-label="List format"
              className="h-8 w-8"
               style={{ color: toolbarIconColor }}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
             <Button 
              variant="outline" 
              size="icon" 
              onClick={handleImageAction}
              aria-label="Add or Edit Image URL"
              className="h-8 w-8"
               style={{ color: toolbarIconColor }}
            >
              <ImagePlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-end space-x-2 pt-2 sticky bottom-0 bg-inherit z-10 pb-6 -mb-6 -mx-6 px-6 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" style={{ color: toolbarIconColor }}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} variant="default">
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default NoteEditorDialog;
    

