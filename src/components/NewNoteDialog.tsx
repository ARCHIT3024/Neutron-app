
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';

interface NewNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}

const NewNoteDialog: FC<NewNoteDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset content when dialog opens, or set a default
      setContent('New Note! Click to edit...');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (content.trim() === '') {
      // Optional: Add a toast or validation message if content is empty
      onSave('New Note! Click to edit...'); // Save with default if empty
    } else {
      onSave(content);
    }
    onClose(); // Close dialog after saving
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-card-foreground">Create New Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-note-content" className="text-sm font-medium text-card-foreground/80">
              Note Content
            </Label>
            <Textarea
              id="new-note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="min-h-[150px] text-sm bg-background border-border focus:ring-primary focus:border-primary rounded-md p-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end space-x-2">
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
