import { useDrag } from 'react-dnd';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { PriorityBadge } from '@/app/components/priority-badge';
import { TaskTypeBadge } from '@/app/components/task-type-badge';
import { DurationDisplay } from '@/app/components/timer-display';
import type { Task } from '@/lib/types';
import { DollarSign, Play } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isTimerActive?: boolean;
}

export function TaskCard({ task, onClick, isTimerActive }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, columnId: task.columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const totalMinutes = task.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card 
        className="p-3 cursor-pointer hover:border-primary transition-colors"
        onClick={onClick}
      >
        <div className="space-y-2">
          {/* Title */}
          <h4 className="text-sm font-medium line-clamp-2">
            {task.title}
          </h4>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TaskTypeBadge type={task.type} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {task.billable && (
                <div className="flex items-center gap-1 text-xs text-[#10B981]">
                  <DollarSign className="size-3" />
                  <span>Billable</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isTimerActive && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Play className="size-3 animate-pulse" />
                </div>
              )}
              
              {totalMinutes > 0 && (
                <DurationDisplay minutes={totalMinutes} className="text-xs text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
