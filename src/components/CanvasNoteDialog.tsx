
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
import { Label } from '@/components/ui/label';
import CanvasEditor from '@/components/CanvasEditor';
import type { Note } from '@/types';

interface CanvasNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { id?: string; title: string; canvasData: string; color: string; tags: Tag[] }) => void;
  noteToEdit?: Note | null;
}

const PRESET_COLORS = ['#FFFFFF', '#FFFACD', '#ADD8E6', '#90EE90', '#FFB6C1', '#FFDAB9', '#E6E6FA']; // For card background

const CanvasNoteDialog: FC<CanvasNoteDialogProps> = ({ isOpen, onClose, onSave, noteToEdit }) => {
  const [title, setTitle] = useState('');
  const getCanvasDataRef = useRef<() => string | undefined>();
  const titleInputRef = useRef<HTMLInputElement>(null);
  // For canvas notes, color from NewNoteDialog might be for the card background.
  // Canvas editor itself will have a white background.
  const [selectedCardColor, setSelectedCardColor] = useState<string>(PRESET_COLORS[0]);
  const [tagsString, setTagsString] = useState<string>('');


  useEffect(() => {
    if (isOpen) {
      if (noteToEdit) {
        setTitle(noteToEdit.title || '');
        setSelectedCardColor(noteToEdit.color || PRESET_COLORS[0]);
        setTagsString(noteToEdit.tags?.map(tag => tag.name).join(', ') || '');
        // Auto-focus title for existing canvas notes
        setTimeout(() => titleInputRef.current?.focus(), 100);
      } else {
        setTitle('');
        setSelectedCardColor(PRESET_COLORS[0]); // Default card background
        setTagsString('');
        // Auto-focus title for new canvas notes
        setTimeout(() => titleInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, noteToEdit]);

  const handleSave = () => {
    const canvasData = getCanvasDataRef.current?.();
    if (!canvasData) {
      console.error("Canvas data is not available");
      // Optionally show a toast message to the user
      return;
    }
    
    const parsedTags: Tag[] = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tagName => tagName !== '')
      .map(tagName => ({ id: crypto.randomUUID(), name: tagName }));

    onSave({
      id: noteToEdit?.id,
      title,
      canvasData,
      color: selectedCardColor, // This color is for the NoteCard background
      tags: parsedTags,
    });
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] bg-card shadow-xl rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-card-foreground">
            {noteToEdit ? 'Edit Canvas Note' : 'Create New Canvas Note'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="canvas-note-title" className="text-sm font-medium text-card-foreground/80">
              Title
            </Label>
            <Input
              ref={titleInputRef}
              id="canvas-note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Canvas Note Title"
              className="text-base bg-background/80 border-input focus:ring-primary focus:border-primary rounded-md p-3"
            />
          </div>
          
          <CanvasEditor 
            initialDataURL={noteToEdit?.canvasData}
            getCanvasDataRef={getCanvasDataRef}
          />

          {/* Card Background Color and Tags for Canvas Note Card Styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
             <div className="grid gap-2">
                <Label htmlFor="canvas-note-card-color" className="text-sm font-medium text-card-foreground/80">
                Card Background Color
                </Label>
                {/* Simple select for now, could be enhanced with color swatches later */}
                <select 
                    id="canvas-note-card-color" 
                    value={selectedCardColor} 
                    onChange={(e) => setSelectedCardColor(e.target.value)}
                    className="text-sm bg-background/80 border-input focus:ring-primary focus:border-primary rounded-md p-3"
                >
                    {PRESET_COLORS.map(color => (
                        <option key={color} value={color} style={{backgroundColor: color}}>
                           {color} {/* Could show color name or just hex */}
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="canvas-note-tags" className="text-sm font-medium text-card-foreground/80">
                Tags (comma-separated)
              </Label>
              <Input
                id="canvas-note-tags"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="e.g., sketch, idea"
                className="text-sm bg-background/80 border-input focus:ring-primary focus:border-primary rounded-md p-3"
              />
            </div>
          </div>

        </div>
        <DialogFooter className="sm:justify-end space-x-2 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="bg-background/80 hover:bg-background">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} variant="default">
            Save Canvas Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Minimal Tag interface for CanvasNoteDialog context
interface Tag {
  id: string;
  name: string;
}


export default CanvasNoteDialog;
