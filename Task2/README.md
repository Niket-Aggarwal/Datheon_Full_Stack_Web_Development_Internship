# 📝 Task 2: PulseTask - Productivity & Task Management App
> **Part of the Datheon Full Stack Web Development Internship Program**  
> Developed by **Niket Aggarwal**

## 📌 Project Overview
This project represents the deliverable for **Task 2** of the **Datheon Full Stack Web Development Internship**. **PulseTask** is a modern, responsive, and feature-rich productivity and task management web application crafted from scratch using **pure web technologies** (HTML5, CSS3, ES6+ JavaScript and HTML5 Canvas API) with zero external frameworks or dependencies

The application empowers users to capture, organize, prioritize and track their daily workflows with fluid micro-interactions, drag-and-drop reordering, dynamic productivity metrics, gamified celebration feedback and persistent local storage

### 🔗 Quick Links
- **Live Preview URL**: [https://dev123.vercel.app/](https://todo-nik.vercel.app/)
- **Main Repository**: [Datheon Full Stack Web Development Internship](../README.md)
- **Task Directory**: [`Task2/`](./)

## ✨ Key Features
- 🔄 **Comprehensive Task CRUD Operations**:
  - **Create**: Quickly add tasks with title, category, priority level and due date
  - **Read**: Dynamic list rendering with responsive badge indicators and empty states
  - **Update**: Edit existing tasks in an accessible modal dialog with pre-filled inputs
  - **Delete**: Instant task deletion paired with an interactive **Undo** toast mechanism
  - **Batch Clear**: Dedicated "Clear Completed" action with user confirmation

- 📊 **Real-Time Productivity Metrics & Progress Bar**:
  - Dynamic completion rate calculation (`%` indicator and animated progress bar)
  - Synchronized counters for **Total**, **Active** and **Completed** tasks across tabs and header summary

- 🔍 **Multi-Dimensional Filtering & Instant Search**:
  - **Status Tabs**: Easily toggle between `All`, `Active`, and `Completed` tasks
  - **Category Filter**: Filter tasks across 5 categories — `Work` (💼), `Personal` (🏡), `Study` (📚), `Health` (🏃), and `Finance` (💰)
  - **Instant Search**: Real-time keyword filter with a quick-clear (`✕`) action
  - **Smart Sorting**:
    - ↕️ *Manual Order* (enables drag-and-drop reordering)
    - 📅 *Due Date (Earliest)*
    - 📅 *Due Date (Latest)*
    - ⚡ *Priority (High 🔥 → Medium ⚡ → Low 🌱)*
    - 🔤 *Alphabetical (A–Z)*

- ↕️ **Native HTML5 Drag-and-Drop Reordering**:
  - Reorder tasks naturally in "Manual Order" mode using dedicated grab handles
  - Visual drop targets and drop-zone feedback
  - Seamless reordering reflected in the underlying data structure and auto-saved to storage

- 📅 **Smart Due Date Tracking**:
  - Relative date calculations highlighting tasks as `Overdue (Xd ago)`, `Due Today`, `Due Tomorrow`, or formatted date (`MMM DD`)
  - Distinct color-coded warning pills alerting users of imminent or expired deadlines

- 🎉 **Gamified Confetti Celebration**:
  - Custom HTML5 Canvas physics-based confetti engine triggering joyful particle bursts whenever a task is marked complete

- 🍞 **Toast Notification System with Undo**:
  - Non-intrusive feedback toasts for task creation, completion, editing and deletion
  - Includes a 4-second window to restore accidentally deleted tasks to their exact prior position

- 🌓 **Dynamic Dark / Light Theme Mode**:
  - Sleek dark mode by default with ambient background gradient glow effects
  - One-click theme toggle with seamless CSS custom properties transition
  - Persistent theme selection stored in `localStorage`

- 💾 **Robust Local Storage Persistence**:
  - All tasks, order states, and theme preferences persist between browser sessions and page refreshes

- ♿ **Accessibility & Responsive Ergonomics**:
  - Keyboard accessible modal dialog with `Escape` key listener and backdrop click dismissal
  - Semantic HTML structure and ARIA attributes (`aria-label`, `aria-selected`, `aria-live`, `role="tab"`, `role="dialog"`)
  - Fully responsive design scaling smoothly across mobile phones, tablets and high-resolution desktops

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic structure (`<header>`, `<main>`, `<section>`, `<form>`), ARIA dialog & tab controls |
| **Styling** | CSS3 | Custom CSS properties (design tokens), Glassmorphism, CSS Grid, Flexbox, Keyframe animations |
| **Behavior** | JavaScript (ES6+) | Event-driven architecture, state management, sorting algorithms, drag-and-drop API |
| **Graphics** | HTML5 Canvas API | Standalone lightweight confetti physics engine for completion celebrations |
| **Storage** | Web Storage API | `localStorage` serialization for tasks (`pulsetask_tasks_v1`) and theme (`pulsetask_theme_v1`) |

## 📁 Directory Structure

```text
Task2/
├── index.html        
├── style.css        
├── script.js   
└── README.md    
```
## 🧠 Code Architecture & Implementation Highlights

### 1. State Management & Persistent Storage (`script.js`)
```javascript
const STORAGE_KEY = 'pulsetask_tasks_v1';

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showToast('Failed to save to local storage.');
  }
}
```
State modifications (adding, completing, editing, reordering, deleting) cleanly invoke `saveToLocalStorage()` and `renderTasks()` to keep UI and storage strictly synchronized

### 2. Multi-Criteria Query Pipeline (`getProcessedTasks`)
```javascript
function getProcessedTasks() {
  return tasks
    .filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    })
    .filter(task => currentCategory === 'all' || task.category === currentCategory)
    .filter(task => !searchQuery || task.title.toLowerCase().includes(searchQuery))
    .sort((a, b) => { /* manual, date, priority, or alphabetical sorting */ });
}
```
Combines status filters, category matching, live keyword searches, and dynamic sort comparators in a single predictable pipeline

### 3. Native HTML5 Drag-and-Drop Reordering
```javascript
function handleDrop(e) {
  e.stopPropagation();
  if (draggedItem && this !== draggedItem) {
    const fromIndex = tasks.findIndex(t => t.id === draggedItem.dataset.id);
    const toIndex = tasks.findIndex(t => t.id === this.dataset.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedTask] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, movedTask);
      saveToLocalStorage();
      renderTasks();
    }
  }
}
```
Enables intuitive manual prioritization with zero external drag libraries

### 4. Interactive Particle Confetti Celebration
```javascript
function triggerConfetti() {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext('2d');
  // Simulates velocity, gravity, friction, rotation, and opacity decay
}
```
Built directly into the DOM using an overlay `<canvas>` to celebrate task achievements with micro-rewards

## 📄 License
This project was built as part of the **Datheon Full Stack Web Development Internship**