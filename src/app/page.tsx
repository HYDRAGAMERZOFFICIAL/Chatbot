import { ChatInterface } from '@/components/ChatInterface';
import { Logo } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent } from '@/components/ui/sidebar';
import { ChatHistory } from '@/components/ChatHistory';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 w-full border-b bg-card/90 backdrop-blur-sm">
          <div className="flex h-16 items-center px-4">
            <SidebarTrigger className="md:hidden -ml-2" />
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <Logo />
              <h1 className="font-headline text-lg font-bold text-primary">
                Collegewala
              </h1>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
            <Sidebar collapsible="icon" side="left" variant="sidebar" className="hidden md:flex">
                <SidebarContent className="py-2">
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
