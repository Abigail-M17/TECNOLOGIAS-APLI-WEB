class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initElements();
        this.bindEvents();
        this.render();
    }

    initElements() {
        this.taskInput = document.getElementById('task-input');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.tasksList = document.getElementById('tasks-list');
        this.totalTasksEl = document.getElementById('total-tasks');
        this.completedTasksEl = document.getElementById('completed-tasks');
        this.emptyState = document.getElementById('empty-state');
        this.noResults = document.getElementById('no-results');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.clearAllBtn = document.getElementById('clear-all');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Eventos principales
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filtros
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Acciones globales
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // Event listener para input vacío
        this.taskInput.addEventListener('input', () => {
            this.addTaskBtn.disabled = this.taskInput.value.trim() === '';
            this.addTaskBtn.style.opacity = this.taskInput.value.trim() === '' ? '0.5' : '1';
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.taskInput.value = '';
        this.saveTasks();
        this.render();
        this.addTaskBtn.disabled = true;
        this.addTaskBtn.style.opacity = '0.5';
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            this.editingId = null;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    startEdit(id) {
        this.editingId = id;
        this.render();
        
        // Enfocar el input de edición
        const editInput = document.querySelector(`[data-task-id="${id}"] .task-edit-input`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Actualizar UI de filtros
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    clearCompleted() {
        if (this.tasks.length === 0) {
            alert('¡La lista de tareas está vacía!');
            return;
        }
        if (this.tasks.filter(t => t.completed).length === 0) {
            alert('¡No hay tareas completadas!');
            return;
        }
        if (confirm('¿Eliminar todas las tareas completadas?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
        }
    }

    clearAll() {
        if (this.tasks.length === 0) {
            alert('¡La lista de tareas está vacía!');
            return;
        }
        if (confirm('¿Estás seguro de que quieres eliminar TODAS las tareas?')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        
        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
    }

    showEmptyState() {
        const filteredTasks = this.getFilteredTasks();
        const hasTasks = this.tasks.length > 0;
        
        this.emptyState.classList.toggle('hidden', hasTasks);
        
        this.noResults.classList.toggle('hidden', !hasTasks || filteredTasks.length > 0);
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Limpiar lista
        this.tasksList.innerHTML = '';
        
        // Renderizar tareas
        filteredTasks.forEach(task => {
            const taskEl = this.createTaskElement(task);
            this.tasksList.appendChild(taskEl);
        });
        
        // Actualizar estadísticas
        this.updateStats();
        
        // Manejar estados vacíos
        this.showEmptyState();
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;

        const isEditing = this.editingId === task.id;

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="todoApp.toggleTask(${task.id})"
            >
            <div class="task-content">
                <div class="task-text ${isEditing ? 'editing' : ''}">${this.escapeHtml(task.text)}</div>
                <input 
                    type="text" 
                    class="task-edit-input ${isEditing ? 'editing' : ''}"
                    value="${this.escapeHtml(task.text)}"
                    data-task-id="${task.id}"
                    maxlength="100"
                >
            </div>
            <div class="task-actions">
                ${!task.completed ? `
                    <button class="action-btn btn-edit" onclick="todoApp.startEdit(${task.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="action-btn btn-delete" onclick="todoApp.deleteTask(${task.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Event listeners para edición
        if (isEditing) {
            const editInput = li.querySelector('.task-edit-input');
            const saveEdit = () => {
                const newText = editInput.value.trim();
                if (newText) {
                    this.editTask(task.id, newText);
                } else {
                    this.cancelEdit();
                }
            };

            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') this.cancelEdit();
            });

            editInput.addEventListener('blur', saveEdit);
        }

        return li;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        const list = Object(this);
        const length = list.length >>> 0;
        const thisArg = arguments[1];
        for (let i = 0; i < length; i++) {
            if (predicate.call(thisArg, list[i], i, list)) {
                return list[i];
            }
        }
        return undefined;
    };
}