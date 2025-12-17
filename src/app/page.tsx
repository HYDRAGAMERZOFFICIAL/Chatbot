import { ChatInterface } from '@/components/ChatInterface';
import { Logo } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent } from '@/components/ui/sidebar';
import { ChatHistory } from '@/components/ChatHistory';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 w-full border-b bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <Logo />
              <h1 className="font-headline text-xl font-bold text-primary">
                collge wala
              </h1>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
            <Sidebar collapsible="icon" side="left" variant="sidebar" className="hidden md:flex">
                <SidebarContent>
                    <ChatHistory />
                </SidebarContent>
            </Sidebar>
          <SidebarInset>
            <ChatInterface />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
