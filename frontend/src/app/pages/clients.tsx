import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { EmptyState } from '@/app/components/empty-state';
import { Plus, Search, Users, Building2, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';

export function ClientsPage() {
  const clients = useAppStore(state => state.clients);
  const projects = useAppStore(state => state.projects);
  const addClient = useAppStore(state => state.addClient);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter a client name');
      return;
    }

    addClient({
      name: formData.name,
      notes: formData.notes || undefined
    });

    toast.success('Client created successfully');
    setIsDialogOpen(false);
    setFormData({ name: '', notes: '' });
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  if (clients.length === 0) {
    return (
      <div className="container max-w-4xl py-8">
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start creating projects"
          action={{
            label: 'Add Client',
            onClick: () => setIsDialogOpen(true)
          }}
        />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client to organize your projects
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="TechCorp Inc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this client..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Client</Button>
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
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your clients and their projects
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client to organize your projects
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="TechCorp Inc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this client..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredClients.map(client => {
          const clientProjects = getClientProjects(client.id);
          
          return (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-muted p-3">
                    <Building2 className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{client.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {clientProjects.length} {clientProjects.length === 1 ? 'project' : 'projects'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.notes && (
                  <p className="text-sm text-muted-foreground">
                    {client.notes}
                  </p>
                )}
                
                {clientProjects.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Projects</div>
                    <div className="flex flex-wrap gap-2">
                      {clientProjects.map(project => (
                        <Badge key={project.id} variant="secondary" className="gap-1">
                          <FolderKanban className="size-3" />
                          {project.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
