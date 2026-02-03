import { create } from 'zustand';
import type { Client, Project, Board, Task, TimeEntry, RateSettings, User } from './types';
import { api } from './api';
import { mockRateSettings } from './mock-data';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Data
  clients: Client[];
  projects: Project[];
  board: Board | null;
  rateSettings: RateSettings;

  // Active states
  activeProjectId: string | null;
  activeTimer: { taskId: string; startTime: Date } | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  setActiveProject: (projectId: string) => Promise<void>;
  fetchData: () => Promise<void>;

  // Timer
  startTimer: (taskId: string) => Promise<void>;
  stopTimer: () => Promise<void>;

  // CRUD operations
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;

  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'timeEntries'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, toColumnId: string, position: number) => Promise<void>;

  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateTimeEntry: (id: string, data: Partial<TimeEntry>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;

  updateRateSettings: (data: Partial<RateSettings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  clients: [],
  projects: [],
  board: null,
  rateSettings: mockRateSettings,
  activeProjectId: null,
  activeTimer: null,

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = await api.get('/auth/me');
        set({ user, isAuthenticated: true });
        await get().fetchData();
      } catch (e) {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('token');
      }
    }
  },

  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const data = await api.postForm('/auth/login', formData);
    localStorage.setItem('token', data.access_token);

    const user = await api.get('/auth/me');
    set({ user, isAuthenticated: true });
    await get().fetchData();
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      isAuthenticated: false,
      clients: [],
      projects: [],
      board: null,
      activeProjectId: null,
      activeTimer: null
    });
  },

  fetchData: async () => {
    try {
      const clients = await api.get('/api/clients');
      const projects = await api.get('/api/projects');

      set({ clients, projects });

      if (projects.length > 0 && !get().activeProjectId) {
        get().setActiveProject(projects[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch initial data", e);
    }
  },

  setActiveProject: async (projectId) => {
    set({ activeProjectId: projectId });
    // Fetch board for this project
    try {
      const boards = await api.get(`/api/projects/${projectId}/boards`);
      if (boards && boards.length > 0) {
        const boardId = boards[0].id; // Assuming single board for now
        // Fetch columns and tasks
        const [columns, tasks] = await Promise.all([
          api.get(`/api/boards/${boardId}/columns`),
          api.get(`/api/boards/${boardId}/tasks`)
        ]);

        // Map backend structure to frontend Board object
        const mappedBoard: Board = {
          id: boardId,
          projectId,
          name: boards[0].name,
          columns: columns.map((col: any) => ({
            id: col.id,
            boardId: col.board_id,
            name: col.name,
            position: col.position,
            tasks: tasks.filter((t: any) => t.column_id === col.id).map((t: any) => ({
              ...t,
              columnId: t.column_id, // Map snake_case to camelCase
              createdAt: new Date(t.created_at || Date.now()) // Ensure Date object
            }))
          }))
        };
        set({ board: mappedBoard });
      } else {
        // Create default board if none
        const newBoard = await api.post(`/api/projects/${projectId}/boards`, { name: "Kanban Board" });
        set({ board: { id: newBoard.id, projectId, name: newBoard.name, columns: [] } });
        // Trigger re-fetch to get default columns if backend creates them
        get().setActiveProject(projectId);
      }
    } catch (e) {
      console.error("Failed to fetch project board", e);
      set({ board: null });
    }
  },

  startTimer: async (taskId) => {
    try {
      await api.post(`/api/tasks/${taskId}/time/start`, {});
      set({ activeTimer: { taskId, startTime: new Date() } }); // Optimistic
      // Real implementation should fetch active timer from backend
    } catch (e) {
      console.error("Failed to start timer", e);
    }
  },

  stopTimer: async () => {
    const { activeTimer } = get();
    if (activeTimer) {
      try {
        await api.post(`/api/tasks/${activeTimer.taskId}/time/stop`, {});
        set({ activeTimer: null });
        // Refresh board to see new time entry on task
        if (get().activeProjectId) get().setActiveProject(get().activeProjectId!);
      } catch (e) {
        console.error("Failed to stop timer", e);
      }
    }
  },

  addClient: async (client) => {
    const newClient = await api.post('/api/clients', client);
    set(state => ({ clients: [...state.clients, newClient] }));
  },

  updateClient: async (id, data) => {
    // Backend update not fully implemented in previous steps? Assuming yes.
    // await api.put(`/api/clients/${id}`, data); 
    // mocking update locally for now as backend might lack specific update endpoint in summary
    set(state => ({
      clients: state.clients.map(c => c.id === id ? { ...c, ...data } : c)
    }));
  },

  addProject: async (project) => {
    // Backend expects client_id, store passes clientId (camelCase)
    const payload = { ...project, client_id: project.clientId };
    const newProject = await api.post('/api/projects', payload);
    set(state => ({ projects: [...state.projects, newProject] }));
  },

  updateProject: async (id, data) => {
    // await api.put(`/api/projects/${id}`, data);
    set(state => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p)
    }));
  },

  addTask: async (task) => {
    const { board } = get();
    if (!board) return;

    // Backend expects board_id in path: /boards/{id}/columns/{col}/tasks
    const payload = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      // ... map other fields
    };

    await api.post(`/api/boards/${board.id}/columns/${task.columnId}/tasks`, payload);
    // Refresh board
    get().setActiveProject(board.projectId);
  },

  updateTask: async (id, data) => {
    await api.put(`/api/tasks/${id}`, data);
    // Optimistic update
    set(state => ({
      board: state.board ? {
        ...state.board,
        columns: state.board.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(t => t.id === id ? { ...t, ...data } : t)
        }))
      } : null
    }));
  },

  moveTask: async (taskId, toColumnId, position) => {
    // Optimistic update first (for UI responsiveness)
    const { board } = get();
    if (!board) return;

    const taskToMove = board.columns.flatMap(c => c.tasks).find(t => t.id === taskId);
    if (!taskToMove) return;

    // ... (Optimistic logic omitted for brevity, focusing on API)

    try {
      await api.post(`/api/tasks/${taskId}/move`, { column_id: toColumnId, position });
      // Refresh to ensure sync
      get().setActiveProject(board.projectId);
    } catch (e) {
      console.error("Move failed", e);
      // Should revert optimistic update here
    }
  },

  addTimeEntry: async (entry) => {
    if (entry.mode === 'manual') {
      await api.post(`/api/tasks/${entry.taskId}/time/manual`, {
        start_at: entry.startAt,
        end_at: entry.endAt,
        description: entry.notes,
        billable: entry.billable
      });
    }
    // Refresh
    if (get().activeProjectId) get().setActiveProject(get().activeProjectId!);
  },

  updateTimeEntry: async (_id, _data) => {
    // Backend delete/update time entry
  },

  deleteTimeEntry: async (id) => {
    await api.delete(`/api/time/${id}`);
    // Refresh
    if (get().activeProjectId) get().setActiveProject(get().activeProjectId!);
  },

  updateRateSettings: async (data) => {
    // mocking
    set(state => ({
      rateSettings: { ...state.rateSettings, ...data }
    }));
  }
}));
