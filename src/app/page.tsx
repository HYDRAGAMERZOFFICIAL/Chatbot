import { ChatInterface } from '@/components/ChatInterface';
import { Logo } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent } from '@/components/ui/sidebar';
import { ChatHistory } from '@/components/ChatHistory';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="sticky top-0 z-10 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="flex h-16 items-center px-4 gap-3">
            <SidebarTrigger className="md:hidden -ml-2 text-slate-600 hover:text-slate-900" />
            <div className="flex items-center gap-3 flex-1 md:flex-none">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <Logo />
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Collegewala
                </h1>
                <p className="text-xs text-slate-500 font-medium">AI College Assistant</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
            <Sidebar collapsible="icon" side="left" variant="sidebar" className="hidden md:flex border-r border-slate-200/50">
                <SidebarContent className="py-4">
                    <ChatHistory />
                </SidebarContent>
            </Sidebar>
          <SidebarInset className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <ChatInterface />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
