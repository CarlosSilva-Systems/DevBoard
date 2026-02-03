import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { DurationDisplay } from '@/app/components/timer-display';
import { Calendar, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export function TimesheetPage() {
  const board = useAppStore(state => state.board);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Calculate week range
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get all tasks with time entries
  const tasks = board?.columns.flatMap(col => col.tasks) || [];
  const tasksWithTime = tasks.filter(task => task.timeEntries.length > 0);

  // Group time entries by task and day
  const getTimeEntriesForTaskAndDay = (taskId: string, day: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];
    
    return task.timeEntries.filter(entry => {
      const entryDate = entry.startAt || entry.createdAt;
      return format(new Date(entryDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });
  };

  const getTotalForDay = (day: Date) => {
    let total = 0;
    tasksWithTime.forEach(task => {
      const entries = getTimeEntriesForTaskAndDay(task.id, day);
      total += entries.reduce((sum, entry) => sum + entry.duration, 0);
    });
    return total;
  };

  const getTotalForTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.timeEntries.reduce((sum, entry) => sum + entry.duration, 0) || 0;
  };

  const weekTotal = weekDays.reduce((sum, day) => sum + getTotalForDay(day), 0);

  const handleLockPeriod = () => {
    // In real app, this would update all entries to locked: true
    setIsLocked(true);
    setShowLockDialog(false);
    toast.success(`Week of ${format(weekStart, 'MMM d')} has been locked`);
  };

  return (
    <div className="container max-w-7xl py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Timesheet</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-initial">
            <Calendar className="size-4" />
            <span className="hidden sm:inline">Change Week</span>
          </Button>
          
          <Button 
            variant={isLocked ? "outline" : "default"}
            className="gap-2 flex-1 sm:flex-initial"
            onClick={() => setShowLockDialog(true)}
            disabled={isLocked}
          >
            <Lock className="size-4" />
            {isLocked ? 'Locked' : 'Lock Period'}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Week Summary</CardTitle>
          <CardDescription>
            Total hours tracked this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-3xl font-bold">
                <DurationDisplay minutes={weekTotal} />
              </div>
              <p className="text-sm text-muted-foreground">Total hours</p>
            </div>
            
            {isLocked && (
              <Badge variant="destructive" className="gap-1">
                <Lock className="size-3" />
                Period Locked
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timesheet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Task</TableHead>
                  {weekDays.map(day => (
                    <TableHead key={day.toString()} className="text-center min-w-[80px]">
                      <div className="text-xs">{format(day, 'EEE')}</div>
                      <div className="font-normal text-muted-foreground">{format(day, 'd')}</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksWithTime.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={weekDays.length + 2} className="text-center text-muted-foreground py-8">
                      No time entries for this week
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {tasksWithTime.map(task => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{task.title}</div>
                            {task.billable && (
                              <Badge variant="outline" className="text-xs">Billable</Badge>
                            )}
                          </div>
                        </TableCell>
                        {weekDays.map(day => {
                          const entries = getTimeEntriesForTaskAndDay(task.id, day);
                          const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
                          
                          return (
                            <TableCell key={day.toString()} className="text-center">
                              {total > 0 && (
                                <DurationDisplay minutes={total} className="text-sm" />
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-medium">
                          <DurationDisplay minutes={getTotalForTask(task.id)} />
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals Row */}
                    <TableRow className="font-semibold bg-muted/50">
                      <TableCell>Daily Totals</TableCell>
                      {weekDays.map(day => (
                        <TableCell key={day.toString()} className="text-center">
                          <DurationDisplay minutes={getTotalForDay(day)} />
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <DurationDisplay minutes={weekTotal} />
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lock Period Warning Dialog */}
      <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Lock Time Period?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Locking this period will prevent any modifications to time entries for the week of{' '}
                <strong>{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</strong>.
              </p>
              <p className="text-destructive font-medium">
                ⚠️ This action cannot be undone in the MVP version.
              </p>
              <p>
                Locked entries cannot be edited or deleted. Use this feature when you've finalized your timesheet
                for invoicing or reporting purposes.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLockPeriod} className="bg-destructive hover:bg-destructive/90">
              Lock Period
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}