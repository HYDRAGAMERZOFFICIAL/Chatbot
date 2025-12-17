import { ChatInterface } from '@/components/ChatInterface';
import { Logo } from '@/components/icons';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent } from '@/components/ui/sidebar';
import { ChatHistory } from '@/components/ChatHistory';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="sticky top-0 z-10 w-full border-b border-slate-200 bg-gradient-to-r from-white via-blue-50 to-white shadow-sm">
          <div className="flex h-12 items-center px-3 gap-2">
            <SidebarTrigger className="md:hidden -ml-2 text-slate-700 hover:text-slate-900" />
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg hover:shadow-xl transition-shadow">
                <Logo />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent leading-none">
                  Collegewala
                </h1>
                <p className="text-xs text-slate-500 font-medium">AI Assistant</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden w-full">
            <Sidebar collapsible="icon" side="left" variant="sidebar" className="hidden md:flex border-r border-slate-300 bg-white">
                <SidebarContent className="py-2">
                    <ChatHistory />
                </SidebarContent>
            </Sidebar>
          <SidebarInset className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
            <ChatInterface />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
