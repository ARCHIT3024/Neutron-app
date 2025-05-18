
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/hooks/use-theme';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Neutron',
  description: 'Interactive notes and canvas app by Neutron.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="neutron-theme">
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset> {/* SidebarInset is a <main> tag, already flex flex-col min-h-svh */}
              <div className="flex-grow"> {/* This div will contain the page content and grow */}
                {children}
              </div>
              <footer className="py-3 px-6 text-center border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  &copy; {currentYear} Archit Khandelwal. All rights reserved.
                </p>
              </footer>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
