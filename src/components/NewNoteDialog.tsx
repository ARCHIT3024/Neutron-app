
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Input
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { Palette, Tags, Bold, Underline, List } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NewNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => void; // Updated to include title
}

const NewNoteDialog: FC<NewNoteDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(''); // Start with empty title
      setContent(''); // Start with empty content
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(title, content); 
    onClose(); 
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleFeatureAlert = (featureName: string, markdownHint?: string) => {
    let message = `${featureName} feature is not fully implemented yet.`;
    if (markdownHint) {
      message += `\n\nFor now, you can use markdown: ${markdownHint}`;
    }
    alert(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-card-foreground">Create New Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-note-title" className="text-sm font-medium text-card-foreground/80">
              Title
            </Label>
            <Input
              id="new-note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-base bg-background border-border focus:ring-primary focus:border-primary rounded-md p-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-note-content" className="text-sm font-medium text-card-foreground/80">
              Content
            </Label>
            <Textarea
              id="new-note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="min-h-[150px] text-sm bg-background border-border focus:ring-primary focus:border-primary rounded-md p-3"
              // Removed autoFocus from content to allow title to be focused first if desired, or add to title
            />
          </div>
          
          <Separator className="my-2" />

          <div className="flex items-center justify-start space-x-2 px-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeatureAlert("Change Color")}
              aria-label="Change note color"
              className="h-8 w-8"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeatureAlert("Edit Tags")}
              aria-label="Edit tags"
              className="h-8 w-8"
            >
              <Tags className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-2" />

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeatureAlert("Bold text", "**bold text**")}
              aria-label="Bold text"
              className="h-8 w-8"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeatureAlert("Underline text", "<u>underlined text</u> (HTML must be rendered appropriately)")}
              aria-label="Underline text"
              className="h-8 w-8"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleFeatureAlert("List format", "\n* Item 1\n* Item 2")}
              aria-label="List format"
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-end space-x-2 pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
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

export default NewNoteDialog;
