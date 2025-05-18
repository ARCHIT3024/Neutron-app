
"use client";

import { Settings as SettingsIconLucide } from 'lucide-react'; // Renamed to avoid conflict
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const { isMobile } = useSidebar();
  // Add state for theme toggle if implementing light/dark mode switch
  // const [isDarkMode, setIsDarkMode] = useState(false); // Example state
  // const toggleTheme = () => {
  //   const newIsDarkMode = !isDarkMode;
  //   setIsDarkMode(newIsDarkMode);
  //   document.documentElement.classList.toggle('dark', newIsDarkMode);
  // };


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
          Configure your StickyCanvas experience. More settings coming soon!
        </p>
        
        <div className="flex items-center space-x-2 my-4">
          {/* 
          // Example for a functional switch:
          <Switch 
            id="dark-mode-toggle" 
            // checked={isDarkMode} 
            // onCheckedChange={toggleTheme} 
            aria-label="Toggle dark mode" 
          />
          <Label htmlFor="dark-mode-toggle">Dark Mode</Label> 
          */}
           <p className="text-sm text-muted-foreground">(Dark mode toggle coming soon)</p>
        </div>

        <Button asChild className="mt-4">
          <Link href="/">Back to Notes</Link>
        </Button>
      </main>
    </div>
  );
}
