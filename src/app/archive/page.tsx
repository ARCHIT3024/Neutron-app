"use client";

import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';


export default function ArchivePage() {
  const { isMobile } = useSidebar();
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger />}
          <h1 className="text-2xl font-semibold">Archived Notes</h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <Archive className="w-24 h-24 text-muted-foreground mb-6" />
        <h2 className="text-3xl font-semibold mb-3">Archive Is Empty</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Notes you archive will appear here. You can restore them or delete them permanently later.
        </p>
        <Button asChild>
          <Link href="/">Back to Notes</Link>
        </Button>
      </main>
    </div>
  );
}
