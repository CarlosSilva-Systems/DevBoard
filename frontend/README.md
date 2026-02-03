# 🚀 DevBoard BI - Freelancer Project Management & Time Tracking

> A complete, production-ready web application for freelance developers to manage projects, track time, and generate billing reports.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.12-38bdf8)

## ✨ Features

### 🎯 Project Management
- **Projects Hub**: Manage multiple client projects with custom rates
- **Client Management**: Organize projects by client with notes
- **Kanban Board**: Drag-and-drop task management (Trello-style)
- **Task Details**: Complete task tracking with tags, priority, complexity

### ⏱️ Time Tracking
- **Live Timer**: Start/stop timer with real-time counter
- **Manual Entry**: Add time manually with notes
- **Billable Toggle**: Mark time as billable or non-billable
- **Locked Entries**: Finalize time periods for billing integrity

### 📊 Reports & Analytics
- **KPI Dashboard**: Total hours, revenue, effective rates
- **Visual Charts**: Bar charts for hours and revenue by task type
- **Breakdown Tables**: Project and task type breakdowns
- **CSV Export**: Export reports for invoicing

### ⚙️ Configuration
- **Rate Settings**: Base hourly rate with per-project overrides
- **Margin Calculator**: Calculate optimal rates from costs
- **Multi-Currency**: Support for BRL, USD, EUR

### 🤖 AI Assistant (Preview)
- **Project Knowledge Base**: Store project context for future AI features
- **UI Ready**: Placeholder for upcoming AI-powered features
- **Planned Features**: Backlog generation, complexity estimation, insights

## 🎨 Design Highlights

- **Dark Mode First**: Beautiful dark theme optimized for long coding sessions
- **Minimal & Clean**: Distraction-free interface focused on productivity
- **Fully Responsive**: Desktop-first but works perfectly on mobile
- **Modern UI**: Using Radix UI components with smooth animations

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible components
- **Zustand** for state management
- **React DnD** for drag-and-drop
- **Recharts** for data visualization
- **Date-fns** for date handling
- **Vite** for blazing-fast builds

## 🚀 Quick Start

### Demo Access
1. Open the application
2. Enter **any email and password** to login
3. Explore with pre-loaded mock data

### Default User
- **Name**: Alex Developer
- **Email**: alex@devboard.dev

## 📖 User Guide

See [DEVBOARD_BI_GUIDE.md](./DEVBOARD_BI_GUIDE.md) for complete documentation including:
- Feature walkthroughs
- Workflows and best practices
- Keyboard shortcuts
- Tips for optimal use

## 🏗️ Technical Documentation

See [TECHNICAL_SUMMARY.md](./TECHNICAL_SUMMARY.md) for:
- Architecture overview
- Component structure
- State management details
- API integration points (future)
- Performance optimizations

## 📱 Responsive Design

### Desktop (1440×900+)
- Fixed sidebar navigation
- Horizontal Kanban board scrolling
- Full-width charts and tables
- Side drawer for task details

### Mobile (390×844)
- Bottom navigation bar
- Vertical Kanban column stacking
- Full-screen task drawer
- Touch-optimized controls

## 🎯 Main Workflows

### 1️⃣ Create a Project
```
Projects → New Project → Select Client → Enter Details → Create
```

### 2️⃣ Track Time on Task
```
Board → Click Task → Start Timer → (work) → Stop Timer
```

### 3️⃣ Weekly Review
```
Timesheet → Review Entries → Lock Period → Ready for Billing
```

### 4️⃣ Generate Report
```
Reports → Select Period → Review KPIs → Export CSV
```

## 🎨 Color Scheme

### Dark Mode (Default)
- Background: `#0B0F14` (Deep dark)
- Cards: `#1A1F26` (Elevated)
- Primary: `#7C3AED` (Purple)
- Success: `#10B981` (Green - Billable)
- Destructive: `#EF4444` (Red - Warnings)

## 🔐 Data & Security

**⚠️ MVP Notice**: This is a frontend demo using local state (Zustand).

- **No Backend**: All data is stored in browser memory
- **No Persistence**: Refresh loses data
- **Mock Auth**: Any credentials work
- **Single User**: No multi-user support

### Production Roadmap (Phase 2)
- Supabase backend integration
- Real authentication
- Database persistence
- Row-level security
- Multi-user support

## 📊 Key Metrics Explained

### Total Hours
Sum of ALL time tracked (billable + non-billable)

### Billable Hours  
Only time marked as billable (generates revenue)

### Total Value
`Billable Hours × Hourly Rate = Revenue`

### Effective Rate (Billable)
`Revenue ÷ Billable Hours = Rate for billable work`

### Effective Rate (Overall)
`Revenue ÷ Total Hours = True hourly rate`

**💡 Why it matters**: Shows if non-billable work is eating into profitability

## 🚧 Current Limitations

- ❌ No data persistence (refresh loses data)
- ❌ No backend/database
- ❌ Cannot unlock locked time periods
- ❌ AI features not yet functional
- ❌ No team collaboration
- ❌ No invoice generation

## 🔮 Future Enhancements

### Phase 2 (Coming Soon)
- ✅ Supabase backend integration
- ✅ Real authentication & persistence
- ✅ Invoice generation
- ✅ Advanced analytics
- ✅ Budget tracking

### Phase 3 (Planned)
- ✅ AI-powered features (estimation, insights)
- ✅ Team collaboration
- ✅ Client portal
- ✅ Integrations (Slack, GitHub, etc.)
- ✅ Mobile native apps

## 🎓 Learning Resources

This project demonstrates:
- ✅ Complex React application architecture
- ✅ TypeScript best practices
- ✅ Zustand state management
- ✅ Drag-and-drop interactions
- ✅ Responsive design patterns
- ✅ Chart/data visualization
- ✅ Form handling and validation
- ✅ Dark mode implementation

## 📄 License

This is a demo project created for educational purposes.

## 🤝 Contributing

This is an MVP demo. For production features, wait for Phase 2 with backend integration.

## ⭐ Star History

If you found this project helpful or inspiring, consider starring it!

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

**Version**: 1.0.0 (MVP Phase 1)  
**Status**: Demo/Preview  
**Last Updated**: February 2, 2026
