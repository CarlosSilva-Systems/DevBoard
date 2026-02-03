# DevBoard BI - User Guide

## Overview
DevBoard BI is a complete project management and time tracking application for freelance developers. It combines Kanban-style task management with powerful time tracking, reporting, and billing features.

## 🎨 Design System

### Color Scheme (Dark Mode Default)
- **Background**: `#0B0F14` (Very dark blue-gray)
- **Cards**: `#1A1F26` (Slightly lighter)
- **Primary/Accent**: `#7C3AED` (Purple)
- **Success/Billable**: `#10B981` (Green)
- **Destructive/Warning**: `#EF4444` (Red)

### Typography
- Font: System font stack (clean, readable)
- Headings: Medium weight (500)
- Body: Regular weight (400)
- Font sizes: 14-16px base

## 🚀 Getting Started

### Login
- **Demo Access**: Use any email and password to login
- The app will automatically log you in with mock data
- Default user: Alex Developer (alex@devboard.dev)

## 📱 Main Features

### 1. Projects Hub
**Location**: First screen after login

**Features**:
- View all your client projects
- See weekly hours and rates per project
- Quick access to project boards
- Create new projects with custom rates
- Search and filter projects

**Actions**:
- Click **"New Project"** to create
- Click any project card to open its Kanban board
- Each project can have custom hourly rates and currency

### 2. Clients Management
**Location**: Sidebar → Clients

**Features**:
- Manage all your clients
- Add notes about each client
- See which projects belong to each client
- Track project count per client

**Actions**:
- Click **"Add Client"** to create new client
- View all projects associated with each client

### 3. Kanban Board (Main Workspace)
**Location**: Click on any project OR Sidebar → Board

**Features**:
- **4 Default Columns**: Backlog → In Progress → Review → Done
- **Drag & Drop**: Move tasks between columns
- **WIP Limits**: Columns show warnings when over capacity
- **Quick Add**: Fast task creation from any column
- **Task Cards Show**:
  - Title and tags
  - Task type (Feature/Bug/Support/Meeting)
  - Priority level (Low/Medium/High)
  - Billable status
  - Time tracked
  - Active timer indicator

**Desktop**: Horizontal scrolling columns
**Mobile**: Vertical stacked columns

**Actions**:
- **Drag tasks** between columns
- **Click "Quick add"** in any column
- **Click a task card** to open detailed drawer
- **Click "New Task"** for full form

### 4. Task Drawer (Detail View)
**Opens when**: Clicking any task card

**Features**:
- **Edit mode**: Click pencil icon to edit task details
- **Task Information**:
  - Title, description (markdown support)
  - Type, priority, complexity (1-5)
  - Estimated time
  - Tags
  - Billable toggle

- **Time Tracking**:
  - **Start/Stop Timer**: Large button with live counter
  - **Manual Entry**: Add time manually (hours + minutes)
  - **Time Entries List**: All tracked time for this task
  - **Entry Actions**:
    - Toggle billable/non-billable
    - Delete entry (if not locked)
    - View notes and timestamps
  - **Locked Entries**: Show lock badge, cannot be edited

**Mobile**: Opens as full-screen modal

### 5. Timesheet
**Location**: Sidebar → Timesheet

**Features**:
- **Weekly View**: Shows 7 days (Monday-Sunday)
- **Table Format**: Tasks as rows, days as columns
- **Totals**: 
  - Daily totals per column
  - Task totals per row
  - Week grand total
- **Lock Period**: Finalize week for billing (irreversible in MVP)

**Actions**:
- Change week with date picker
- Lock period when ready to invoice
- View all billable vs non-billable time

### 6. Reports & Analytics
**Location**: Sidebar → Reports

**Features**:
- **KPI Cards**:
  - Total hours (with billable breakdown)
  - Total value (revenue from billable hours)
  - Effective rate (billable only)
  - Effective rate (overall including non-billable)

- **Charts**:
  - Hours by task type (bar chart)
  - Value by task type (revenue chart)
  
- **Breakdown Tables**:
  - Project breakdown (hours, value)
  - Task type breakdown (hours, value)

- **Export**: Download CSV reports

**Filters**: Week or Month view

### 7. Settings
**Location**: Sidebar → Settings

**Features**:
- **Base Hourly Rate**: Your default billable rate
- **Internal Cost Rate**: Your actual cost (optional)
- **Target Margin %**: Desired profit margin (optional)
- **Currency**: Default currency (BRL/USD/EUR)

**Smart Features**:
- Automatic rate suggestion based on cost + margin
- Unsaved changes warning
- Per-project rate override available

### 8. AI Assistant (Preview)
**Location**: Sidebar → AI Assistant

**Status**: UI ready, functionality coming soon

**Planned Features**:
- Project knowledge base
- AI-powered backlog generation
- Automatic complexity estimation
- Chat interface for project insights

**Current State**:
- Save project requirements/context
- Preview of future AI features
- All buttons disabled with "Soon" badges

## 🎯 Workflows

### Typical Work Session

1. **Start Work**
   - Go to Projects → Click your project
   - Open Kanban Board
   - Click a task from "In Progress"

2. **Track Time**
   - In Task Drawer, click **"Start Timer"**
   - Timer runs in background (visible in top bar)
   - Click **"Stop Timer"** when done
   - Time entry automatically added

3. **Add Manual Time**
   - Open task drawer
   - Click **"Add Manual Entry"**
   - Enter hours and minutes
   - Add notes
   - Save

4. **End of Week**
   - Go to Timesheet
   - Review all entries
   - Click **"Lock Period"** to finalize
   - ⚠️ Locked entries cannot be changed!

5. **Generate Invoice**
   - Go to Reports
   - Select week/month period
   - Review KPIs and breakdown
   - Click **"Export CSV"**
   - Use data for invoicing

## 📊 Key Metrics Explained

### Total Hours
Sum of ALL time entries (billable + non-billable)

### Billable Hours
Only time marked as billable (green dollar icon)

### Total Value
Billable hours × hourly rate = Revenue

### Effective Rate (Billable)
Total value ÷ billable hours = What you actually earned per billable hour

### Effective Rate (Overall)
Total value ÷ total hours = True hourly rate including non-billable work

**Why it matters**: If you work 10h but only 8h are billable, your effective overall rate is lower than your official rate. This helps you see if you're spending too much time on non-billable tasks.

## 💡 Tips & Best Practices

### Task Organization
- Use **tags** liberally (backend, frontend, urgent, etc.)
- Set **complexity** to help with future estimates
- Add **estimated time** to track accuracy
- Mark **billable** correctly from the start

### Time Tracking
- Start timer immediately when working
- Add manual entries for forgotten time same day
- Use **notes** in time entries to remember context
- Review timesheet weekly before locking

### Billing
- Set project rates when creating projects
- Lock timesheet periods after client approval
- Export reports before invoicing
- Track effective rates to optimize pricing

### Project Management
- Use **WIP limits** to prevent multitasking
- Move tasks through columns as you progress
- Keep "In Progress" focused (3-5 tasks max)
- Archive completed projects

## 🎨 Responsive Design

### Desktop (1440×900+)
- Sidebar navigation (240px)
- Horizontal Kanban columns
- Full tables and charts
- Drawer slides from right

### Mobile (390×844)
- Bottom navigation (4 main items)
- Vertical Kanban columns
- Responsive tables (horizontal scroll)
- Full-screen task drawer
- Optimized touch targets

## 🔐 Data & Privacy

**MVP Note**: This is a frontend demo using local state management (Zustand). In production:
- Data would persist to database
- User authentication would be real
- Time entries would sync across devices
- Locked periods would be permanently enforced

## 🚧 Limitations (MVP v1)

- **No persistence**: Refresh loses data
- **Single user**: No multi-user support
- **No unlock**: Locked periods stay locked
- **No AI**: Features coming in future
- **Mock auth**: Any credentials work
- **No API**: All data is local

## 🎯 Future Enhancements

Phase 2 (Coming Soon):
- Real authentication with Supabase
- Data persistence
- Multi-project boards
- Invoice generation
- Team collaboration
- Mobile native apps

Phase 3 (Planned):
- AI-powered features
- Advanced analytics
- Integrations (Slack, GitHub, etc.)
- Custom workflows
- Budget tracking
- Client portal

## 🎨 Keyboard Shortcuts (Planned)

- `Ctrl/Cmd + K`: Quick search
- `N`: New task
- `Space`: Start/stop timer (in drawer)
- `/`: Focus search

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive

## 🌙 Dark Mode

**Default**: Dark mode is active by default
**Toggle**: Not implemented in MVP (coming soon)

## ❓ FAQ

**Q: Can I use this for client work?**
A: This is an MVP demo. For production use, wait for Phase 2 with real backend.

**Q: Where is my data stored?**
A: Currently in browser memory (Zustand). Refreshing loses data.

**Q: Can I import/export data?**
A: Reports can be exported to CSV. Full data export coming in Phase 2.

**Q: How do I unlock a locked timesheet?**
A: MVP doesn't support unlocking. This enforces immutability for billing integrity.

**Q: When will AI features work?**
A: AI features are in development. UI is ready and waiting for backend integration.

**Q: Can multiple people use the same project?**
A: Not in MVP. Team features coming in Phase 3.

---

**Built with**: React, TypeScript, Tailwind CSS v4, Radix UI, Recharts, React DnD, Zustand, Date-fns

**Version**: 1.0.0 (MVP Phase 1)
