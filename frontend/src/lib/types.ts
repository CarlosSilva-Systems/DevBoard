// DevBoard BI - Type Definitions

export type Priority = 'low' | 'medium' | 'high';
export type TaskType = 'feature' | 'bug' | 'support' | 'meeting';
export type TaskStatus = 'open' | 'done';
export type Currency = 'BRL' | 'USD' | 'EUR';

export interface Client {
  id: string;
  name: string;
  notes?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  currency: Currency;
  hourlyRateOverride?: number;
  createdAt: Date;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  columns: Column[];
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  wipLimit?: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  tags: string[];
  priority: Priority;
  type: TaskType;
  complexity: number; // 1-5
  estimatedMinutes?: number;
  billable: boolean;
  status: TaskStatus;
  position: number;
  timeEntries: TimeEntry[];
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  mode: 'timer' | 'manual';
  startAt?: Date;
  endAt?: Date;
  duration: number; // minutes
  notes?: string;
  billable: boolean;
  locked: boolean;
  createdAt: Date;
}

export interface RateSettings {
  id: string;
  baseHourlyRate: number;
  internalCostRate?: number;
  targetMarginPct?: number;
  defaultCurrency: Currency;
}

export interface TimesheetPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  locked: boolean;
  lockedAt?: Date;
}

export interface ReportData {
  totalHours: number;
  billableHours: number;
  totalValue: number;
  effectiveRateBillable: number;
  effectiveRateOverall: number;
  projectBreakdown: ProjectBreakdown[];
  typeBreakdown: TypeBreakdown[];
}

export interface ProjectBreakdown {
  projectId: string;
  projectName: string;
  hours: number;
  billableHours: number;
  value: number;
}

export interface TypeBreakdown {
  type: TaskType;
  hours: number;
  billableHours: number;
  value: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
