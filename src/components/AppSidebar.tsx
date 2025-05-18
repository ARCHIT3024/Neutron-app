
"use client"; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Archive, Trash2, StickyNote, Settings, LogOut, Pin, PinOff, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppSidebar() {
  const pathname = usePathname(); 
  const { togglePin, isPinned, visualState, isMobile } = useSidebar(); // Get sidebar state

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="h-16 flex items-center justify-between p-2">
        <div className="flex items-center gap-2 flex-grow min-w-0" data-testid="sidebar-header-content">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/" aria-label="StickyCanvas Home">
              <StickyNote className="size-6 text-primary" />
            </Link>
          </Button>
          <h2 className={cn(
            "text-lg font-semibold text-sidebar-foreground truncate",
            visualState === 'collapsed' && !isMobile && "hidden" // Hide text when collapsed on desktop
          )}>
            StickyCanvas
          </h2>
        </div>
        {!isMobile && ( // Only show Pin button on desktop
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePin} 
            className={cn(
              "shrink-0 text-sidebar-foreground hover:text-sidebar-primary",
               visualState === 'collapsed' ? "hidden" : "flex" // Show only when expanded
            )}
            aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isPinned ? <PinOff className="size-5" /> : <Pin className="size-5" />}
          </Button>
        )}
         {isMobile && ( // Show hamburger trigger only on mobile
            <Button
                variant="ghost"
                size="icon"
                onClick={togglePin} // On mobile, togglePin effectively toggles the sheet
                className="shrink-0 text-sidebar-foreground hover:text-sidebar-primary"
                aria-label="Toggle navigation menu"
            >
                <PanelLeft className="size-5" />
            </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: 'Home', side: 'right', align: 'center' }}
              aria-label="Home"
              isActive={pathname === '/'} 
            >
              <Link href="/">
                <Home />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: 'Archive', side: 'right', align: 'center' }}
              aria-label="Archive"
              isActive={pathname === '/archive'} 
            >
              <Link href="/archive">
                <Archive />
                <span>Archive</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: 'Trash', side: 'right', align: 'center' }}
              aria-label="Trash"
              isActive={pathname === '/trash'} 
            >
              <Link href="/trash">
                <Trash2 />
                <span>Trash</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: 'Settings', side: 'right', align: 'center' }}
              aria-label="Settings"
              isActive={pathname === '/settings'}
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Placeholder for Logout - Firebase Auth to be integrated */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip={{ children: 'Log Out', side: 'right', align: 'center' }}
              aria-label="Log Out"
              // Add onClick and role when functionality is implemented
              // onClick={() => console.log("Log out clicked")} 
              // role="button"
              // tabIndex={0} // Ensure it's focusable if it becomes a real button
            >
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
