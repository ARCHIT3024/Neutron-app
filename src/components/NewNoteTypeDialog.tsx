
"use client";

import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextIcon, BrushIcon } from 'lucide-react';

interface NewNoteTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'text' | 'canvas') => void;
}

const NewNoteTypeDialog: FC<NewNoteTypeDialogProps> = ({ isOpen, onClose, onSelectType }) => {
  const handleSelect = (type: 'text' | 'canvas') => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
          <DialogDescription>
            What type of note would you like to create?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center" onClick={() => handleSelect('text')}>
            <TextIcon className="h-8 w-8 mb-2" />
            Text Note
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center" onClick={() => handleSelect('canvas')}>
            <BrushIcon className="h-8 w-8 mb-2" />
            Canvas Note
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewNoteTypeDialog;
