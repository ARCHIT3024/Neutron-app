
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
  useSidebar, 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Archive, Trash2, StickyNote, Settings, LogOut, PanelLeft } from 'lucide-react'; // Pin, PinOff removed as button is removed
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


export default function AppSidebar() {
  const pathname = usePathname(); 
  const { visualState, isMobile, toggleOverallSidebar } = useSidebar(); 

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="h-16 flex items-center justify-between p-2">
        <div className="flex items-center gap-2 flex-grow min-w-0" data-testid="sidebar-header-content">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <Link href="/" aria-label="Neutron Home">
                  <StickyNote className="size-6 text-primary" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={visualState !== "collapsed" || isMobile}>
              <p>Neutron</p>
            </TooltipContent>
          </Tooltip>
          <h2 className={cn(
            "text-lg font-semibold text-sidebar-foreground truncate",
            (visualState === 'collapsed' && !isMobile) && "hidden" 
          )}>
            Neutron
          </h2>
        </div>
         {isMobile && ( 
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleOverallSidebar} 
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
              aria-label="Log Out (not implemented)"
              aria-disabled="true"
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
