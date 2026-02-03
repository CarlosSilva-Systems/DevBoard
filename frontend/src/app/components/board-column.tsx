import { useDrop } from 'react-dnd';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { TaskCard } from '@/app/components/task-card';
import { Plus, AlertCircle } from 'lucide-react';
import type { Column, Task } from '@/lib/types';

interface BoardColumnProps {
  column: Column;
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, columnId: string) => void;
  onQuickAdd: (columnId: string) => void;
  activeTimerTaskId?: string;
}

export function BoardColumn({ column, onTaskClick, onTaskDrop, onQuickAdd, activeTimerTaskId }: BoardColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; columnId: string }) => {
      if (item.columnId !== column.id) {
        onTaskDrop(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const isOverWipLimit = column.wipLimit && column.tasks.length >= column.wipLimit;

  return (
    <div className="flex-shrink-0 w-full md:w-80">
      <Card className="flex flex-col h-auto md:h-[calc(100vh-12rem)]">
        {/* Column Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{column.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.tasks.length}
              </Badge>
            </div>
            
            {column.wipLimit && (
              <Badge 
                variant={isOverWipLimit ? "destructive" : "outline"}
                className="text-xs"
              >
                {isOverWipLimit && <AlertCircle className="size-3 mr-1" />}
                WIP: {column.wipLimit}
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => onQuickAdd(column.id)}
          >
            <Plus className="size-4" />
            Quick add
          </Button>
        </div>

        {/* Tasks List */}
        <div
          ref={drop}
          className={`flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] md:min-h-0 ${
            isOver ? 'bg-primary/5' : ''
          }`}
        >
          {column.tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-sm text-muted-foreground">
              <p>No tasks</p>
              <p className="text-xs">Drag tasks here or use quick add</p>
            </div>
          ) : (
            column.tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                isTimerActive={activeTimerTaskId === task.id}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}