
"use client";

import { Settings as SettingsIconLucide, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from '@/hooks/use-theme';

export default function SettingsPage() {
  const { isMobile } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const isDarkMode = theme === 'dark';

  return (
    <div className="flex flex-col h-screen">
       <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          {isMobile && <SidebarTrigger aria-label="Toggle sidebar" />}
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <SettingsIconLucide className="w-24 h-24 text-muted-foreground mb-6" aria-hidden="true" />
        <h2 className="text-3xl font-semibold mb-3">App Settings</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Configure your StickyCanvas experience.
        </p>
        
        <div className="flex items-center space-x-3 my-4 p-4 border rounded-lg shadow-sm bg-card">
          <Switch 
            id="dark-mode-toggle" 
            checked={isDarkMode} 
            onCheckedChange={toggleTheme} 
            aria-label="Toggle dark mode" 
          />
          <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2 cursor-pointer">
            {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
          </Label> 
        </div>

        <Button asChild className="mt-4">
          <Link href="/">Back to Notes</Link>
        </Button>
      </main>
    </div>
  );
}
