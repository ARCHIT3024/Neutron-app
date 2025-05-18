export interface Tag {
  id: string;
  name: string;
  color?: string; // Optional: hex color for tag badge
}

export interface Note {
  id: string;
  title?: string; // Optional title for the note
  content: string;
  color: string; // Hex color string for note background
  tags: Tag[];
  isPinned: boolean;
  imageUrl?: string;
  dataAiHint?: string; // Hint for AI image search if imageUrl is a placeholder
  summary?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  position?: { x: number; y: number }; // For draggable notes, to be implemented
  // type: 'text' | 'canvas'; // To distinguish between text and canvas notes
  // canvasData?: any; // Store canvas drawing data

  // New fields for soft delete and archiving
  status: 'active' | 'archived' | 'trashed';
  archivedAt?: string | null; // ISO date string
  trashedAt?: string | null; // ISO date string
}
