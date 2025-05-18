import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Archive, Trash2, StickyNote, Settings, LogOut } from 'lucide-react';

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="h-16 flex items-center justify-between p-2">
        <div className="flex items-center gap-2" data-testid="sidebar-header-content">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/" aria-label="StickyCanvas Home">
              <StickyNote className="size-6 text-primary" />
            </Link>
          </Button>
          <h2 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            StickyCanvas
          </h2>
        </div>
        {/* SidebarTrigger is implicitly handled by Sidebar component for desktop icon mode.
            A trigger for mobile will be in the page header. */}
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: 'Home', side: 'right', align: 'center' }}
              isActive // Assuming home is active by default
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
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Placeholder for Logout - Firebase Auth to be integrated */}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Log Out', side: 'right', align: 'center' }}>
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
