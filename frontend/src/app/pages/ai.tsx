import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Brain, Send, Info, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AIPage() {
  const activeProject = useAppStore(state => {
    const projects = state.projects;
    const activeId = state.activeProjectId;
    return projects.find(p => p.id === activeId);
  });

  const [projectKnowledge, setProjectKnowledge] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKnowledge = () => {
    // In real app, would save to backend
    setIsSaved(true);
    toast.success('Project knowledge saved');
  };

  const handleGenerateBacklog = () => {
    toast.info('AI features will be available in a future update');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    toast.info('AI chat will be available in a future update');
    setChatMessage('');
  };

  if (!activeProject) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">
          <Brain className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Project</h2>
          <p className="text-muted-foreground">Select a project to use AI features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Brain className="size-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="size-3" />
              Beta Preview
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered features for {activeProject.name}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">AI Features Coming Soon</p>
              <p className="text-xs text-muted-foreground">
                The UI is ready, but AI functionality is not yet enabled. When available, the AI will help you:
                estimate task complexity, generate project backlogs, suggest time estimates, and provide project insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Knowledge */}
      <Card>
        <CardHeader>
          <CardTitle>Project Requirements & Knowledge</CardTitle>
          <CardDescription>
            Provide context about your project to help AI understand your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={projectKnowledge}
            onChange={(e) => {
              setProjectKnowledge(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Describe your project requirements, tech stack, goals, and any important context...

Example:
- E-commerce platform for retail client
- Built with React, Node.js, PostgreSQL
- Focus on mobile-first design
- Target: Launch in Q2 2026
- Key features: Product catalog, shopping cart, payment integration"
            rows={8}
            className="font-mono text-sm"
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isSaved ? (
                <span className="text-green-500">✓ Saved</span>
              ) : (
                'Changes not saved'
              )}
            </p>
            <Button onClick={handleSaveKnowledge}>
              Save Project Knowledge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Generate Backlog */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Backlog</CardTitle>
            <CardDescription className="text-xs">
              Let AI suggest tasks based on project knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    disabled
                    onClick={handleGenerateBacklog}
                  >
                    <Sparkles className="size-4" />
                    Generate with AI
                    <Badge variant="secondary" className="ml-auto">Soon</Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI backlog generation coming in future update</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Estimate Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estimate Complexity</CardTitle>
            <CardDescription className="text-xs">
              AI-powered task complexity estimation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    disabled
                  >
                    <Brain className="size-4" />
                    Auto-estimate Tasks
                    <Badge variant="secondary" className="ml-auto">Soon</Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI estimation coming in future update</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle>AI Chat</CardTitle>
          <CardDescription>
            Ask questions about your project, get suggestions, or request task breakdowns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat messages area */}
          <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-4">
            <div className="space-y-4">
              {/* Welcome message */}
              <div className="flex gap-3">
                <div className="rounded-full bg-primary p-2 h-fit">
                  <Brain className="size-4 text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">DevBoard AI</p>
                  <Card className="bg-card">
                    <CardContent className="p-3">
                      <p className="text-sm">
                        Hello! I'm your DevBoard AI assistant. Currently, I'm in preview mode and not yet operational.
                        Once enabled, I'll be able to help you with task estimation, backlog generation, and project insights.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Disabled notice */}
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <AlertCircle className="size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    AI chat is not yet enabled
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md">
                    This feature will be available in a future update. The UI is ready and waiting!
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask AI about your project... (disabled in preview)"
              rows={2}
              disabled
              className="resize-none"
            />
            <Button type="submit" size="icon" className="shrink-0" disabled>
              <Send className="size-4" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            AI features are in development and will be enabled in a future update
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
