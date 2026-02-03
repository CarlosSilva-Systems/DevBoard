// DevBoard BI - Mock Data

import type { Client, Project, Board, Column, Task, TimeEntry, RateSettings, User } from './types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Alex Developer',
  email: 'alex@devboard.dev'
};

export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'TechCorp Inc.',
    notes: 'Enterprise client - main project',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'client-2',
    name: 'StartupHub',
    notes: 'Fast-paced startup, flexible hours',
    createdAt: new Date('2024-02-20')
  },
  {
    id: 'client-3',
    name: 'DesignStudio Co.',
    createdAt: new Date('2024-11-10')
  }
];

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    clientId: 'client-1',
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce solution with React and Node.js',
    currency: 'BRL',
    hourlyRateOverride: 180,
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'project-2',
    clientId: 'client-2',
    name: 'Mobile App Development',
    description: 'React Native app for iOS and Android',
    currency: 'USD',
    createdAt: new Date('2024-02-25')
  },
  {
    id: 'project-3',
    clientId: 'client-3',
    name: 'Website Redesign',
    description: 'Complete redesign of corporate website',
    currency: 'BRL',
    hourlyRateOverride: 150,
    createdAt: new Date('2024-11-15')
  }
];

export const mockTimeEntries: TimeEntry[] = [
  {
    id: 'time-1',
    taskId: 'task-1',
    mode: 'timer',
    startAt: new Date('2026-02-02T09:00:00'),
    endAt: new Date('2026-02-02T11:30:00'),
    duration: 150,
    notes: 'Initial setup and configuration',
    billable: true,
    locked: false,
    createdAt: new Date('2026-02-02T09:00:00')
  },
  {
    id: 'time-2',
    taskId: 'task-1',
    mode: 'manual',
    duration: 45,
    notes: 'Code review',
    billable: true,
    locked: false,
    createdAt: new Date('2026-02-02T14:00:00')
  },
  {
    id: 'time-3',
    taskId: 'task-2',
    mode: 'timer',
    startAt: new Date('2026-02-02T10:00:00'),
    endAt: new Date('2026-02-02T12:00:00'),
    duration: 120,
    billable: true,
    locked: false,
    createdAt: new Date('2026-02-02T10:00:00')
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    columnId: 'column-2',
    title: 'Implement user authentication',
    description: '## Requirements\n- JWT tokens\n- Email verification\n- Password reset flow',
    tags: ['backend', 'security'],
    priority: 'high',
    type: 'feature',
    complexity: 4,
    estimatedMinutes: 480,
    billable: true,
    status: 'open',
    position: 0,
    timeEntries: mockTimeEntries.filter(t => t.taskId === 'task-1'),
    createdAt: new Date('2026-01-28')
  },
  {
    id: 'task-2',
    columnId: 'column-2',
    title: 'Design database schema',
    description: 'Create normalized schema for users, products, and orders',
    tags: ['database', 'planning'],
    priority: 'high',
    type: 'feature',
    complexity: 3,
    estimatedMinutes: 240,
    billable: true,
    status: 'open',
    position: 1,
    timeEntries: mockTimeEntries.filter(t => t.taskId === 'task-2'),
    createdAt: new Date('2026-01-29')
  },
  {
    id: 'task-3',
    columnId: 'column-3',
    title: 'Build product catalog UI',
    description: 'Responsive grid with filters and search',
    tags: ['frontend', 'ui'],
    priority: 'medium',
    type: 'feature',
    complexity: 3,
    billable: true,
    status: 'open',
    position: 0,
    timeEntries: [],
    createdAt: new Date('2026-01-30')
  },
  {
    id: 'task-4',
    columnId: 'column-1',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    tags: ['devops'],
    priority: 'low',
    type: 'feature',
    complexity: 2,
    estimatedMinutes: 180,
    billable: false,
    status: 'open',
    position: 0,
    timeEntries: [],
    createdAt: new Date('2026-02-01')
  },
  {
    id: 'task-5',
    columnId: 'column-4',
    title: 'Fix checkout validation bug',
    description: 'Credit card validation not working for certain cards',
    tags: ['bug', 'urgent'],
    priority: 'high',
    type: 'bug',
    complexity: 2,
    billable: true,
    status: 'open',
    position: 0,
    timeEntries: [],
    createdAt: new Date('2026-02-02')
  }
];

export const mockColumns: Column[] = [
  {
    id: 'column-1',
    boardId: 'board-1',
    name: 'Backlog',
    position: 0,
    tasks: mockTasks.filter(t => t.columnId === 'column-1')
  },
  {
    id: 'column-2',
    boardId: 'board-1',
    name: 'In Progress',
    position: 1,
    wipLimit: 3,
    tasks: mockTasks.filter(t => t.columnId === 'column-2')
  },
  {
    id: 'column-3',
    boardId: 'board-1',
    name: 'Review',
    position: 2,
    wipLimit: 2,
    tasks: mockTasks.filter(t => t.columnId === 'column-3')
  },
  {
    id: 'column-4',
    boardId: 'board-1',
    name: 'Done',
    position: 3,
    tasks: mockTasks.filter(t => t.columnId === 'column-4')
  }
];

export const mockBoard: Board = {
  id: 'board-1',
  projectId: 'project-1',
  name: 'E-commerce Development Board',
  columns: mockColumns
};

export const mockRateSettings: RateSettings = {
  id: 'rates-1',
  baseHourlyRate: 150,
  internalCostRate: 80,
  targetMarginPct: 40,
  defaultCurrency: 'BRL'
};
