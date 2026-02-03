import { ReactNode } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { 
  Code2, 
  LayoutDashboard, 
  Users, 
  KanbanSquare,
  Clock,
  BarChart3,
  Settings,
  Brain,
  LogOut,
  User,
  Play,
  Square
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface AppShellProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AppShell({ children, currentPage, onNavigate }: AppShellProps) {
  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);
  const activeTimer = useAppStore(state => state.activeTimer);
  const stopTimer = useAppStore(state => state.stopTimer);
  const activeProject = useAppStore(state => {
    const projects = state.projects;
    const activeId = state.activeProjectId;
    return projects.find(p => p.id === activeId);
  });

  const navigation = [
    { name: 'Projects', icon: LayoutDashboard, page: 'projects' },
    { name: 'Clients', icon: Users, page: 'clients' },
    { name: 'Board', icon: KanbanSquare, page: 'board', disabled: !activeProject },
    { name: 'Timesheet', icon: Clock, page: 'timesheet' },
    { name: 'Reports', icon: BarChart3, page: 'reports' },
    { name: 'Settings', icon: Settings, page: 'settings' },
    { name: 'AI Assistant', icon: Brain, page: 'ai', disabled: !activeProject },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-full">
        {/* Sidebar */}
        <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
            <div className="bg-primary rounded-lg p-1.5">
              <Code2 className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">DevBoard BI</span>
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.page}
                  variant={currentPage === item.page ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    currentPage === item.page && 'bg-sidebar-accent',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !item.disabled && onNavigate(item.page)}
                  disabled={item.disabled}
                >
                  <item.icon className="size-4" />
                  {item.name}
                </Button>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-3 border-t border-sidebar-border">
            {activeProject && (
              <div className="text-xs text-muted-foreground mb-3 px-2">
                <div className="font-medium">Active Project</div>
                <div className="truncate">{activeProject.name}</div>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <User className="size-4" />
                  <span className="truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold capitalize">
                {currentPage === 'board' && activeProject?.name}
                {currentPage !== 'board' && currentPage}
              </h2>
            </div>

            {activeTimer && (
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Timer Running</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopTimer}
                  className="gap-2"
                >
                  <Square className="size-3" />
                  Stop
                </Button>
              </div>
            )}
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile Top Bar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Code2 className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">DevBoard BI</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="size-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="border-t border-border bg-card">
          <div className="grid grid-cols-4 gap-1 p-2">
            <Button
              variant={currentPage === 'projects' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-col h-auto py-2 gap-1"
              onClick={() => onNavigate('projects')}
            >
              <LayoutDashboard className="size-4" />
              <span className="text-xs">Projects</span>
            </Button>
            
            <Button
              variant={currentPage === 'board' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-col h-auto py-2 gap-1"
              onClick={() => onNavigate('board')}
              disabled={!activeProject}
            >
              <KanbanSquare className="size-4" />
              <span className="text-xs">Board</span>
            </Button>
            
            <Button
              variant={currentPage === 'reports' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-col h-auto py-2 gap-1"
              onClick={() => onNavigate('reports')}
            >
              <BarChart3 className="size-4" />
              <span className="text-xs">Reports</span>
            </Button>
            
            <Button
              variant={currentPage === 'settings' ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-col h-auto py-2 gap-1"
              onClick={() => onNavigate('settings')}
            >
              <Settings className="size-4" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
