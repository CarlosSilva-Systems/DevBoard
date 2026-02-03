import type { TaskType } from '@/lib/types';
import { Badge } from '@/app/components/ui/badge';
import { Wrench, Bug, Headphones, Users } from 'lucide-react';

interface TaskTypeBadgeProps {
  type: TaskType;
}

export function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  const config = {
    feature: { icon: Wrench, label: 'Feature', className: 'bg-chart-1/20 text-chart-1 border-chart-1/30' },
    bug: { icon: Bug, label: 'Bug', className: 'bg-destructive/20 text-destructive border-destructive/30' },
    support: { icon: Headphones, label: 'Support', className: 'bg-chart-2/20 text-chart-2 border-chart-2/30' },
    meeting: { icon: Users, label: 'Meeting', className: 'bg-chart-4/20 text-chart-4 border-chart-4/30' }
  };

  const { icon: Icon, label, className } = config[type];

  return (
    <Badge variant="outline" className={`${className} gap-1 text-xs`}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
