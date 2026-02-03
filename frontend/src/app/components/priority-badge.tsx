import type { Priority } from '@/lib/types';
import { Badge } from '@/app/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    high: { icon: ArrowUp, className: 'bg-destructive/20 text-destructive border-destructive/30' },
    medium: { icon: Minus, className: 'bg-warning/20 text-[#F59E0B] border-warning/30' },
    low: { icon: ArrowDown, className: 'bg-muted text-muted-foreground border-border' }
  };

  const { icon: Icon, className } = config[priority];

  return (
    <Badge variant="outline" className={`${className} gap-1 text-xs`}>
      <Icon className="size-3" />
      {priority}
    </Badge>
  );
}
