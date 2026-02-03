import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Separator } from '@/app/components/ui/separator';
import { Card, CardContent } from '@/app/components/ui/card';
import { PriorityBadge } from '@/app/components/priority-badge';
import { TaskTypeBadge } from '@/app/components/task-type-badge';
import { TimerDisplay, DurationDisplay } from '@/app/components/timer-display';
import { useAppStore } from '@/lib/store';
import { Play, Square, Plus, Trash2, Lock, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, TimeEntry, Priority, TaskType } from '@/lib/types';

interface TaskDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDrawer({ task, open, onClose }: TaskDrawerProps) {
  const updateTask = useAppStore(state => state.updateTask);
  const addTimeEntry = useAppStore(state => state.addTimeEntry);
  const updateTimeEntry = useAppStore(state => state.updateTimeEntry);
  const deleteTimeEntry = useAppStore(state => state.deleteTimeEntry);
  const activeTimer = useAppStore(state => state.activeTimer);
  const startTimer = useAppStore(state => state.startTimer);
  const stopTimer = useAppStore(state => state.stopTimer);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({ hours: '', minutes: '', notes: '' });

  if (!task) return null;

  const isTimerRunning = activeTimer?.taskId === task.id;
  const totalMinutes = task.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const billableMinutes = task.timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0);

  const handleSave = () => {
    if (editedTask && Object.keys(editedTask).length > 0) {
      updateTask(task.id, editedTask);
      toast.success('Task updated');
      setIsEditing(false);
      setEditedTask({});
    }
  };

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      stopTimer();
      toast.success('Timer stopped');
    } else {
      startTimer(task.id);
      toast.success('Timer started');
    }
  };

  const handleAddManualEntry = () => {
    const hours = parseInt(manualEntry.hours) || 0;
    const minutes = parseInt(manualEntry.minutes) || 0;
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes === 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    addTimeEntry({
      taskId: task.id,
      mode: 'manual',
      duration: totalMinutes,
      notes: manualEntry.notes || undefined,
      billable: task.billable,
      locked: false
    });

    toast.success('Time entry added');
    setShowManualEntry(false);
    setManualEntry({ hours: '', minutes: '', notes: '' });
  };

  const handleDeleteEntry = (entryId: string, locked: boolean) => {
    if (locked) {
      toast.error('Cannot delete locked entry');
      return;
    }
    deleteTimeEntry(entryId);
    toast.success('Time entry deleted');
  };

  const toggleEntryBillable = (entry: TimeEntry) => {
    if (entry.locked) {
      toast.error('Cannot modify locked entry');
      return;
    }
    updateTimeEntry(entry.id, { billable: !entry.billable });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTask.title ?? task.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-semibold mb-2"
                />
              ) : (
                <SheetTitle className="text-xl">{task.title}</SheetTitle>
              )}
              <SheetDescription>
                Task #{task.id.slice(-6)}
              </SheetDescription>
            </div>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="size-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsEditing(false);
                  setEditedTask({});
                }}>
                  <X className="size-4" />
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={editedTask.description ?? task.description ?? ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={4}
                placeholder="Add a description..."
              />
            ) : (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || 'No description'}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              {isEditing ? (
                <Select
                  value={editedTask.type ?? task.type}
                  onValueChange={(val: TaskType) => setEditedTask({ ...editedTask, type: val })}
                >
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
              ) : (
                <div>
                  <TaskTypeBadge type={task.type} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              {isEditing ? (
                <Select
                  value={editedTask.priority ?? task.priority}
                  onValueChange={(val: Priority) => setEditedTask({ ...editedTask, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <PriorityBadge priority={task.priority} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Complexity (1-5)</Label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={editedTask.complexity ?? task.complexity}
                  onChange={(e) => setEditedTask({ ...editedTask, complexity: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-sm">{task.complexity}/5</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Estimated Minutes</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedTask.estimatedMinutes ?? task.estimatedMinutes ?? ''}
                  onChange={(e) => setEditedTask({ ...editedTask, estimatedMinutes: parseInt(e.target.value) || undefined })}
                  placeholder="480"
                />
              ) : (
                <div className="text-sm">
                  {task.estimatedMinutes ? `${Math.floor(task.estimatedMinutes / 60)}h ${task.estimatedMinutes % 60}m` : 'Not set'}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {task.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center justify-between">
            <Label>Billable</Label>
            <Switch
              checked={isEditing ? (editedTask.billable ?? task.billable) : task.billable}
              onCheckedChange={(checked) => {
                if (isEditing) {
                  setEditedTask({ ...editedTask, billable: checked });
                } else {
                  updateTask(task.id, { billable: checked });
                }
              }}
            />
          </div>

          <Separator />

          {/* Time Tracking */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Time Tracking</h3>
            </div>

            {/* Timer Controls */}
            <Card className={isTimerRunning ? 'border-primary bg-primary/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {isTimerRunning && activeTimer ? (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Timer Running</div>
                        <TimerDisplay startTime={activeTimer.startTime} className="text-2xl font-bold" />
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No active timer</div>
                    )}
                  </div>
                  
                  <Button
                    size="lg"
                    variant={isTimerRunning ? "destructive" : "default"}
                    onClick={handleTimerToggle}
                    className="gap-2"
                  >
                    {isTimerRunning ? (
                      <>
                        <Square className="size-5" />
                        Stop Timer
                      </>
                    ) : (
                      <>
                        <Play className="size-5" />
                        Start Timer
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry */}
            {!showManualEntry ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowManualEntry(true)}>
                <Plus className="size-4" />
                Add Manual Entry
              </Button>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Manual Time Entry</Label>
                    <Button variant="ghost" size="sm" onClick={() => setShowManualEntry(false)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        value={manualEntry.hours}
                        onChange={(e) => setManualEntry({ ...manualEntry, hours: e.target.value })}
                        placeholder="2"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Minutes</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={manualEntry.minutes}
                        onChange={(e) => setManualEntry({ ...manualEntry, minutes: e.target.value })}
                        placeholder="30"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      value={manualEntry.notes}
                      onChange={(e) => setManualEntry({ ...manualEntry, notes: e.target.value })}
                      placeholder="What did you work on?"
                      rows={2}
                    />
                  </div>
                  
                  <Button onClick={handleAddManualEntry} className="w-full">
                    Add Entry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Time Entries List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Time Entries</span>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Total: <DurationDisplay minutes={totalMinutes} className="inline" /></span>
                  <span>Billable: <DurationDisplay minutes={billableMinutes} className="inline" /></span>
                </div>
              </div>

              {task.timeEntries.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No time entries yet
                </div>
              ) : (
                <div className="space-y-2">
                  {task.timeEntries.map(entry => (
                    <Card key={entry.id} className={entry.locked ? 'border-destructive/30' : ''}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <DurationDisplay minutes={entry.duration} className="font-semibold" />
                              <Badge variant="outline" className="text-xs">
                                {entry.mode}
                              </Badge>
                              {entry.locked && (
                                <Badge variant="destructive" className="text-xs gap-1">
                                  <Lock className="size-3" />
                                  Locked
                                </Badge>
                              )}
                            </div>
                            
                            {entry.notes && (
                              <p className="text-xs text-muted-foreground">{entry.notes}</p>
                            )}
                            
                            {entry.startAt && entry.endAt && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.startAt).toLocaleString()} - {new Date(entry.endAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={entry.billable}
                              onCheckedChange={() => toggleEntryBillable(entry)}
                              disabled={entry.locked}
                            />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id, entry.locked)}
                              disabled={entry.locked}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
