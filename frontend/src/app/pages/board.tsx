import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import { BoardColumn } from '@/app/components/board-column';
import { TaskDrawer } from '@/app/components/task-drawer';
import { EmptyState } from '@/app/components/empty-state';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Plus, KanbanSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, Priority, TaskType } from '@/lib/types';

interface BoardPageProps {
  onNavigate: (page: string) => void;
}

export function BoardPage({ onNavigate }: BoardPageProps) {
  const board = useAppStore(state => state.board);
  const activeProject = useAppStore(state => {
    const projects = state.projects;
    const activeId = state.activeProjectId;
    return projects.find(p => p.id === activeId);
  });
  const addTask = useAppStore(state => state.addTask);
  const moveTask = useAppStore(state => state.moveTask);
  const activeTimer = useAppStore(state => state.activeTimer);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'feature' as TaskType,
    priority: 'medium' as Priority,
    complexity: 3,
    estimatedMinutes: '',
    billable: true,
    tags: ''
  });

  if (!board || !activeProject) {
    return (
      <div className="container max-w-4xl py-8">
        <EmptyState
          icon={KanbanSquare}
          title="No active project"
          description="Please select a project from the Projects page to view its board"
          action={{
            label: 'Go to Projects',
            onClick: () => onNavigate('projects')
          }}
        />
      </div>
    );
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskDrop = (taskId: string, columnId: string) => {
    const column = board.columns.find(c => c.id === columnId);
    if (column) {
      moveTask(taskId, columnId, column.tasks.length);
      toast.success('Task moved');
    }
  };

  const handleQuickAdd = (columnId: string) => {
    setSelectedColumnId(columnId);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a task title');
      return;
    }

    const column = board.columns.find(c => c.id === selectedColumnId);
    if (!column) return;

    addTask({
      columnId: selectedColumnId,
      title: formData.title,
      description: formData.description || undefined,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      priority: formData.priority,
      type: formData.type,
      complexity: formData.complexity,
      estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : undefined,
      billable: formData.billable,
      status: 'open',
      position: column.tasks.length
    });

    toast.success('Task created');
    setIsDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      type: 'feature',
      priority: 'medium',
      complexity: 3,
      estimatedMinutes: '',
      billable: true,
      tags: ''
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        {/* Board Header */}
        <div className="border-b border-border bg-card px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">{board.name}</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                {activeProject.name} • {board.columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks
              </p>
            </div>
            
            <Button className="gap-2 w-full sm:w-auto" onClick={() => {
              setSelectedColumnId(board.columns[0]?.id || '');
              setIsDialogOpen(true);
            }}>
              <Plus className="size-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Board Columns - Desktop: horizontal scroll, Mobile: vertical stack */}
        <div className="flex-1 overflow-auto">
          <div className="hidden md:flex p-6 gap-4 min-h-0">
            {board.columns.map(column => (
              <BoardColumn
                key={column.id}
                column={column}
                onTaskClick={handleTaskClick}
                onTaskDrop={handleTaskDrop}
                onQuickAdd={handleQuickAdd}
                activeTimerTaskId={activeTimer?.taskId}
              />
            ))}
          </div>
          
          {/* Mobile: Vertical Stack */}
          <div className="md:hidden p-4 space-y-4">
            {board.columns.map(column => (
              <div key={column.id} className="w-full">
                <BoardColumn
                  column={column}
                  onTaskClick={handleTaskClick}
                  onTaskDrop={handleTaskDrop}
                  onQuickAdd={handleQuickAdd}
                  activeTimerTaskId={activeTimer?.taskId}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Task Drawer */}
        <TaskDrawer
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />

        {/* New Task Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your board
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Implement user authentication"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task description (supports markdown)..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(val: TaskType) => setFormData({ ...formData, type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(val: Priority) => setFormData({ ...formData, priority: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complexity">Complexity (1-5)</Label>
                    <Input
                      id="complexity"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.complexity}
                      onChange={(e) => setFormData({ ...formData, complexity: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated">Estimated Minutes</Label>
                    <Input
                      id="estimated"
                      type="number"
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                      placeholder="480"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="backend, security, urgent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="billable">Billable</Label>
                  <Switch
                    id="billable"
                    checked={formData.billable}
                    onCheckedChange={(checked) => setFormData({ ...formData, billable: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}