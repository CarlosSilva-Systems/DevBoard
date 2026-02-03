import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { KpiCard } from '@/app/components/kpi-card';
import { Clock, DollarSign, TrendingUp, Target, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

type Period = 'week' | 'month';

export function ReportsPage() {
  const board = useAppStore(state => state.board);
  const projects = useAppStore(state => state.projects);
  const clients = useAppStore(state => state.clients);
  const rateSettings = useAppStore(state => state.rateSettings);
  const activeProjectId = useAppStore(state => state.activeProjectId);
  
  const [period, setPeriod] = useState<Period>('week');
  const [selectedDate] = useState(new Date());

  // Calculate report data
  const reportData = useMemo(() => {
    if (!board) return null;

    const tasks = board.columns.flatMap(col => col.tasks);
    const allEntries = tasks.flatMap(task => 
      task.timeEntries.map(entry => ({ ...entry, task }))
    );

    // Total hours
    const totalMinutes = allEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = totalMinutes / 60;

    // Billable hours
    const billableMinutes = allEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0);
    const billableHours = billableMinutes / 60;

    // Get project rate
    const activeProject = projects.find(p => p.id === activeProjectId);
    const hourlyRate = activeProject?.hourlyRateOverride || rateSettings.baseHourlyRate;

    // Total value
    const totalValue = billableHours * hourlyRate;

    // Effective rates
    const effectiveRateBillable = billableHours > 0 ? totalValue / billableHours : 0;
    const effectiveRateOverall = totalHours > 0 ? totalValue / totalHours : 0;

    // Project breakdown
    const projectBreakdown = projects.map(project => {
      const projectTasks = tasks.filter(task => {
        // In real app, tasks would have projectId. For now, assume current board is for active project
        return activeProjectId === project.id;
      });
      
      const projectEntries = projectTasks.flatMap(task => task.timeEntries);
      const hours = projectEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
      const billable = projectEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.duration, 0) / 60;
      const rate = project.hourlyRateOverride || rateSettings.baseHourlyRate;
      
      return {
        projectName: project.name,
        hours: hours,
        billableHours: billable,
        value: billable * rate,
        currency: project.currency
      };
    }).filter(p => p.hours > 0);

    // Type breakdown
    const typeBreakdown = ['feature', 'bug', 'support', 'meeting'].map(type => {
      const typeTasks = tasks.filter(task => task.type === type);
      const typeEntries = typeTasks.flatMap(task => task.timeEntries);
      const hours = typeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
      const billable = typeEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.duration, 0) / 60;
      
      return {
        type,
        hours: hours,
        billableHours: billable,
        value: billable * hourlyRate
      };
    }).filter(t => t.hours > 0);

    return {
      totalHours,
      billableHours,
      totalValue,
      effectiveRateBillable,
      effectiveRateOverall,
      projectBreakdown,
      typeBreakdown,
      currency: activeProject?.currency || 'BRL'
    };
  }, [board, projects, activeProjectId, rateSettings]);

  if (!reportData) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Start tracking time to see reports</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    toast.success('Report exported to CSV');
    // In real app, would generate and download CSV file
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'BRL': return 'R$';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return currency;
    }
  };

  const chartData = reportData.typeBreakdown.map(item => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    hours: parseFloat(item.hours.toFixed(2)),
    billable: parseFloat(item.billableHours.toFixed(2))
  }));

  return (
    <div className="container max-w-7xl py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Reports</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {period === 'week' ? 'This week' : format(selectedDate, 'MMMM yyyy')}
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={period} onValueChange={(val: Period) => setPeriod(val)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="size-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Hours"
          value={reportData.totalHours.toFixed(1) + 'h'}
          icon={Clock}
          subtitle={`${reportData.billableHours.toFixed(1)}h billable`}
        />
        
        <KpiCard
          title="Total Value"
          value={`${getCurrencySymbol(reportData.currency)} ${reportData.totalValue.toFixed(2)}`}
          icon={DollarSign}
          subtitle="Billable only"
        />
        
        <KpiCard
          title="Effective Rate (Billable)"
          value={`${getCurrencySymbol(reportData.currency)} ${reportData.effectiveRateBillable.toFixed(0)}/h`}
          icon={TrendingUp}
        />
        
        <KpiCard
          title="Effective Rate (Overall)"
          value={`${getCurrencySymbol(reportData.currency)} ${reportData.effectiveRateOverall.toFixed(0)}/h`}
          icon={Target}
          subtitle="Including non-billable"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Hours by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Hours by Task Type</CardTitle>
            <CardDescription>
              Breakdown of time spent by task type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="hours" fill="hsl(var(--chart-1))" name="Total Hours" />
                <Bar dataKey="billable" fill="hsl(var(--chart-3))" name="Billable Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Value by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Value by Task Type</CardTitle>
            <CardDescription>
              Revenue generated by task type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.typeBreakdown.map(item => ({
                name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
                value: parseFloat(item.value.toFixed(2))
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `${getCurrencySymbol(reportData.currency)} ${value}`}
                />
                <Legend />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Project Breakdown */}
        {reportData.projectBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Billable</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.projectBreakdown.map((project, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{project.projectName}</TableCell>
                      <TableCell className="text-right">{project.hours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">{project.billableHours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">
                        {getCurrencySymbol(project.currency)} {project.value.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Task Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.typeBreakdown.map((type, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium capitalize">{type.type}</TableCell>
                    <TableCell className="text-right">{type.hours.toFixed(1)}h</TableCell>
                    <TableCell className="text-right">{type.billableHours.toFixed(1)}h</TableCell>
                    <TableCell className="text-right">
                      {getCurrencySymbol(reportData.currency)} {type.value.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}