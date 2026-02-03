import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { EmptyState } from '@/app/components/empty-state';
import { Plus, Search, FolderKanban, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Currency } from '@/lib/types';

export function ProjectsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const projects = useAppStore(state => state.projects);
  const clients = useAppStore(state => state.clients);
  const addProject = useAppStore(state => state.addProject);
  const setActiveProject = useAppStore(state => state.setActiveProject);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    description: '',
    currency: 'BRL' as Currency,
    hourlyRateOverride: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.name) {
      toast.error('Please fill required fields');
      return;
    }

    addProject({
      clientId: formData.clientId,
      name: formData.name,
      description: formData.description || undefined,
      currency: formData.currency,
      hourlyRateOverride: formData.hourlyRateOverride ? parseFloat(formData.hourlyRateOverride) : undefined
    });

    toast.success('Project created successfully');
    setIsDialogOpen(false);
    setFormData({
      clientId: '',
      name: '',
      description: '',
      currency: 'BRL',
      hourlyRateOverride: ''
    });
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === p.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectClick = (projectId: string) => {
    setActiveProject(projectId);
    onNavigate('board');
  };

  if (projects.length === 0) {
    return (
      <div className="container max-w-4xl py-8">
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start tracking time and managing tasks"
          action={{
            label: 'Create Project',
            onClick: () => setIsDialogOpen(true)
          }}
        />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to track time and manage tasks
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={formData.clientId} onValueChange={(val) => setFormData({ ...formData, clientId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E-commerce Platform"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Project description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(val: Currency) => setFormData({ ...formData, currency: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate Override</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={formData.hourlyRateOverride}
                      onChange={(e) => setFormData({ ...formData, hourlyRateOverride: e.target.value })}
                      placeholder="150.00"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client projects and track time
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to track time and manage tasks
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={formData.clientId} onValueChange={(val) => setFormData({ ...formData, clientId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E-commerce Platform"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Project description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(val: Currency) => setFormData({ ...formData, currency: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate Override</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={formData.hourlyRateOverride}
                      onChange={(e) => setFormData({ ...formData, hourlyRateOverride: e.target.value })}
                      placeholder="150.00"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map(project => {
          const client = clients.find(c => c.id === project.clientId);
          
          return (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleProjectClick(project.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1">{project.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {client?.name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {project.currency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>0h this week</span>
                  </div>
                  {project.hourlyRateOverride && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="size-3" />
                      <span>{project.currency} {project.hourlyRateOverride}/h</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
