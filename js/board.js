let tasks = [];
let currentDraggedElement;

async function initBoard() {
    await loadTasks();
    renderBoard();
}

async function loadTasks() {
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
        console.error('Could not load tasks', e);
        tasks = [];
    }
}

function renderBoard() {
    const columns = ['todo', 'inprogress', 'awaitingfeedback', 'done'];
    
    // Reset columns
    columns.forEach(colId => {
        document.getElementById(colId).innerHTML = '';
    });

    // Render tasks
    tasks.forEach(task => {
        const column = document.getElementById(task.status);
        if (column) {
            column.innerHTML += generateTaskHTML(task);
        }
    });

    // Check empty columns
    checkEmptyColumns();
}

function checkEmptyColumns() {
    const columns = [
        { id: 'todo', label: 'To do' },
        { id: 'inprogress', label: 'In progress' },
        { id: 'awaitingfeedback', label: 'Awaiting Feedback' },
        { id: 'done', label: 'Done' }
    ];

    columns.forEach(col => {
        const element = document.getElementById(col.id);
        if (element.innerHTML.trim() === '') {
            element.innerHTML = `<div class="no-tasks">No tasks ${col.label}</div>`;
        }
    });
}

function generateTaskHTML(task) {
    let categoryColor = getCategoryColor(task.category);
    let subtasksProgress = getSubtasksProgress(task);
    let prioIcon = `assets/img/${task.prio}_icon.png`;

    return `
    <div draggable="true" ondragstart="startDragging(${task.id})" class="task-card">
        <div class="task-category" style="background-color: ${categoryColor}">${task.category}</div>
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        ${subtasksProgress}
        <div class="task-footer">
            <div class="task-contacts">
                <!-- Placeholder for contacts -->
            </div>
            <div class="task-prio">
                <img src="${prioIcon}" alt="${task.prio}">
            </div>
        </div>
    </div>
    `;
}

function getCategoryColor(category) {
    if (category === 'Technical Task') return '#1FD7C1';
    if (category === 'User Story') return '#0038FF';
    return '#888';
}

function getSubtasksProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) return '';
    
    let completed = task.subtasks.filter(s => s.completed).length;
    let total = task.subtasks.length;
    let percent = (completed / total) * 100;

    return `
    <div class="task-subtasks">
        <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${percent}%"></div>
        </div>
        <span class="subtask-text">${completed}/${total} Subtasks</span>
    </div>
    `;
}

function startDragging(id) {
    currentDraggedElement = id;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(status) {
    const taskIndex = tasks.findIndex(t => t.id === currentDraggedElement);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = status;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderBoard();
    }
}