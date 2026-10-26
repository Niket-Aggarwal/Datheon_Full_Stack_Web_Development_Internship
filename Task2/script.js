let tasks = [];
let currentFilter = 'all';
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'manual';
let lastDeletedTask = null;
let toastTimeout = null;
const STORAGE_KEY = 'pulsetask_tasks_v1';
const THEME_STORAGE_KEY = 'pulsetask_theme_v1';
const PRIORITY_WEIGHTS = { High: 3, Medium: 2, Low: 1 };
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title-input');
const taskCategorySelect = document.getElementById('task-category-select');
const taskPrioritySelect = document.getElementById('task-priority-select');
const taskDueDateInput = document.getElementById('task-due-date-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptyDesc = document.getElementById('empty-desc');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const filterCategorySelect = document.getElementById('filter-category-select');
const sortSelect = document.getElementById('sort-select');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const totalCountEl = document.getElementById('total-count');
const completedCountEl = document.getElementById('completed-count');
const progressBarFill = document.getElementById('progress-bar-fill');
const metricsPercentageEl = document.getElementById('metrics-percentage');
const badgeAllEl = document.getElementById('badge-all');
const badgeActiveEl = document.getElementById('badge-active');
const badgeCompletedEl = document.getElementById('badge-completed');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskId = document.getElementById('edit-task-id');
const editTitle = document.getElementById('edit-title');
const editCategory = document.getElementById('edit-category');
const editPriority = document.getElementById('edit-priority');
const editDueDate = document.getElementById('edit-due-date');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');
const toastActionBtn = document.getElementById('toast-action');
const currentDateDisplay = document.getElementById('current-date-display');
const confettiCanvas = document.getElementById('confetti-canvas');
function initApp() {
  initTheme();
  loadFromLocalStorage();
  displayFormattedDate();
  setupEventListeners();
  renderTasks();
}
function displayFormattedDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date().toLocaleDateString(undefined, options);
  currentDateDisplay.textContent = `${today} • Stay organized, focused and productive`;
  taskDueDateInput.value = new Date().toISOString().split('T')[0];
}
function setupEventListeners() {
  taskForm.addEventListener('submit', handleAddTask);
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    renderTasks();
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderTasks();
  });
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.status;
      renderTasks();
    });
  });
  filterCategorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderTasks();
  });
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasks();
  });
  clearCompletedBtn.addEventListener('click', handleClearCompleted);
  editForm.addEventListener('submit', handleSaveEdit);
  closeModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
      closeEditModal();
    }
  });
  themeToggleBtn.addEventListener('click', toggleTheme);
  toastActionBtn.addEventListener('click', handleUndoDelete);
}
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showToast('Failed to save to local storage.');
  }
}
function loadFromLocalStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      tasks = JSON.parse(rawData);
    } else {
      tasks = [];
    }
  } catch (error) {
    tasks = [];
  }
}
function handleAddTask(e) {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) return;
  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    title: title,
    category: taskCategorySelect.value,
    priority: taskPrioritySelect.value,
    dueDate: taskDueDateInput.value || '',
    completed: false,
    createdAt: Date.now()
  };
  tasks.unshift(newTask);
  saveToLocalStorage();
  renderTasks();
  taskTitleInput.value = '';
  taskTitleInput.focus();
  showToast('Task added successfully!');
}
function getProcessedTasks() {
  return tasks
    .filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    })
    .filter(task => {
      if (currentCategory === 'all') return true;
      return task.category === currentCategory;
    })
    .filter(task => {
      if (!searchQuery) return true;
      return task.title.toLowerCase().includes(searchQuery);
    })
    .sort((a, b) => {
      if (currentSort === 'due-asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (currentSort === 'due-desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (currentSort === 'priority') {
        return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
      }
      if (currentSort === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
}
function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  saveToLocalStorage();
  renderTasks();
  if (task.completed) {
    triggerConfetti();
    showToast(`Completed: "${escapeHtml(task.title)}"`);
  }
}
function openEditModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  editTaskId.value = task.id;
  editTitle.value = task.title;
  editCategory.value = task.category;
  editPriority.value = task.priority;
  editDueDate.value = task.dueDate || '';
  editModal.classList.remove('hidden');
  editTitle.focus();
}
function closeEditModal() {
  editModal.classList.add('hidden');
  editForm.reset();
}
function handleSaveEdit(e) {
  e.preventDefault();
  const id = editTaskId.value;
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const newTitle = editTitle.value.trim();
  if (!newTitle) return;
  task.title = newTitle;
  task.category = editCategory.value;
  task.priority = editPriority.value;
  task.dueDate = editDueDate.value;
  saveToLocalStorage();
  renderTasks();
  closeEditModal();
  showToast('Task updated successfully.');
}
function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  lastDeletedTask = {
    task: tasks[taskIndex],
    index: taskIndex
  };
  tasks.splice(taskIndex, 1);
  saveToLocalStorage();
  renderTasks();
  showToast('Task deleted.', true);
}
function handleUndoDelete() {
  if (!lastDeletedTask) return;
  tasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
  saveToLocalStorage();
  renderTasks();
  lastDeletedTask = null;
  hideToast();
  showToast('Task restored.');
}
function handleClearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear.');
    return;
  }
  if (confirm(`Remove ${completedCount} completed task(s)?`)) {
    tasks = tasks.filter(t => !t.completed);
    saveToLocalStorage();
    renderTasks();
    showToast(`Cleared ${completedCount} completed task(s).`);
  }
}
function renderTasks() {
  const processed = getProcessedTasks();
  updateMetrics();
  taskList.innerHTML = '';
  if (processed.length === 0) {
    taskList.classList.add('hidden');
    emptyState.classList.remove('hidden');
    if (searchQuery) {
      emptyTitle.textContent = 'No matching tasks';
      emptyDesc.textContent = `No tasks matched "${searchQuery}". Clear the search to view all.`;
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptyDesc.textContent = 'Mark tasks as done to see them here.';
    } else if (currentFilter === 'active') {
      emptyTitle.textContent = 'All caught up!';
      emptyDesc.textContent = 'You have no active tasks. Enjoy your day or add a new goal.';
    } else {
      emptyTitle.textContent = 'No tasks in this category';
      emptyDesc.textContent = 'Create a new task above to populate this section.';
    }
    return;
  }
  taskList.classList.remove('hidden');
  emptyState.classList.add('hidden');
  const fragment = document.createDocumentFragment();
  processed.forEach(task => {
    const li = createTaskElement(task);
    fragment.appendChild(li);
  });
  taskList.appendChild(fragment);
  initDragAndDrop();
}
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.dataset.id = task.id;
  li.setAttribute('draggable', currentSort === 'manual' ? 'true' : 'false');
  const categoryIconMap = {
    Work: '💼',
    Personal: '🏡',
    Study: '📚',
    Health: '🏃',
    Finance: '💰'
  };
  const dueDateInfo = formatDueDate(task.dueDate);
  li.innerHTML = `
    <div class="drag-handle" title="${currentSort === 'manual' ? 'Drag to reorder' : 'Reordering enabled in Manual Order sort mode'}" aria-label="Drag Handle">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
      </svg>
    </div>
    <label class="checkbox-container" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="task-checkbox" />
      <span class="checkmark">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
    </label>
    <div class="task-content">
      <span class="task-title">${escapeHtml(task.title)}</span>
      <div class="task-meta">
        <span class="badge badge-category" data-category="${task.category}">
          ${categoryIconMap[task.category] || '🏷️'} ${escapeHtml(task.category)}
        </span>
        <span class="badge badge-priority" data-priority="${task.priority}">
          ${task.priority === 'High' ? '🔥' : task.priority === 'Medium' ? '⚡' : '🌱'} ${task.priority}
        </span>
        ${dueDateInfo.html}
      </div>
    </div>
    <div class="task-actions">
      <button class="btn-action btn-edit" title="Edit Task" aria-label="Edit Task" data-id="${task.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </button>
      <button class="btn-action btn-delete" title="Delete Task" aria-label="Delete Task" data-id="${task.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  `;
  const checkbox = li.querySelector('.task-checkbox');
  checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
  const editBtn = li.querySelector('.btn-edit');
  editBtn.addEventListener('click', () => openEditModal(task.id));
  const deleteBtn = li.querySelector('.btn-delete');
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  return li;
}
function formatDueDate(dateStr) {
  if (!dateStr) return { html: '' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = dateStr.split('-');
  const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  let badgeClass = 'badge badge-date';
  let labelText = '';
  if (diffDays < 0) {
    badgeClass += ' overdue';
    labelText = `Overdue (${Math.abs(diffDays)}d ago)`;
  } else if (diffDays === 0) {
    badgeClass += ' due-today';
    labelText = 'Due Today';
  } else if (diffDays === 1) {
    labelText = 'Due Tomorrow';
  } else {
    labelText = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  const html = `
    <span class="${badgeClass}">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      ${labelText}
    </span>
  `;
  return { html };
}
function updateMetrics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  totalCountEl.textContent = total;
  completedCountEl.textContent = completed;
  progressBarFill.style.width = `${percentage}%`;
  metricsPercentageEl.textContent = `${percentage}%`;
  badgeAllEl.textContent = total;
  badgeActiveEl.textContent = active;
  badgeCompletedEl.textContent = completed;
}
let draggedItem = null;
function initDragAndDrop() {
  if (currentSort !== 'manual') return;
  const items = taskList.querySelectorAll('.task-item');
  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}
function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}
function handleDragEnter(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    this.classList.add('drag-over-top');
  }
}
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}
function handleDragLeave() {
  this.classList.remove('drag-over-top');
  this.classList.remove('drag-over-bottom');
}
function handleDrop(e) {
  e.stopPropagation();
  this.classList.remove('drag-over-top');
  this.classList.remove('drag-over-bottom');
  if (draggedItem && this !== draggedItem) {
    const fromId = draggedItem.dataset.id;
    const toId = this.dataset.id;
    const fromIndex = tasks.findIndex(t => t.id === fromId);
    const toIndex = tasks.findIndex(t => t.id === toId);
    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedTask] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, movedTask);
      saveToLocalStorage();
      renderTasks();
    }
  }
}
function handleDragEnd() {
  this.classList.remove('dragging');
  const items = taskList.querySelectorAll('.task-item');
  items.forEach(item => {
    item.classList.remove('drag-over-top');
    item.classList.remove('drag-over-bottom');
  });
  draggedItem = null;
}
function triggerConfetti() {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#38bdf8', '#10b981', '#f59e0b'];
  const particleCount = 45;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight * 0.4,
      radius: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1.2) * 10,
      gravity: 0.35,
      friction: 0.98,
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.rotation += p.vRotation;
      p.opacity -= 0.015;
      if (p.opacity > 0) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.5);
        ctx.restore();
      }
    });
    if (activeParticles > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();
}
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem(THEME_STORAGE_KEY, isLight ? 'light' : 'dark');
}
function showToast(message, allowUndo = false) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessageEl.textContent = message;
  toastActionBtn.classList.toggle('hidden', !allowUndo);
  toastEl.classList.remove('hidden');
  toastTimeout = setTimeout(() => {
    hideToast();
  }, 4000);
}
function hideToast() {
  toastEl.classList.add('hidden');
  if (toastTimeout) clearTimeout(toastTimeout);
}
function getRelativeDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
document.addEventListener('DOMContentLoaded', initApp);