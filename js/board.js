let tasks = [];
let currentDraggedElement;
let taskFormTemplate = ''; // Variable für das Formular-Template

async function initBoard() {
    await loadTasks();
    await loadContacts(); // Kontakte laden, damit wir Zugriff auf Farben/Namen haben
    renderBoard();
    await loadTaskFormTemplate(); // Template laden
}

async function loadTasks() {
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
        console.error('Could not load tasks', e);
        tasks = [];
    }
}

async function loadTaskFormTemplate() {
    try {
        let resp = await fetch('assets/templates/add-task-form.html');
        if (resp.ok) {
            taskFormTemplate = await resp.text();
        }
    } catch (e) { console.error('Could not load task form template', e); }
}

function renderBoard() {
    const columns = ['todo', 'inprogress', 'awaitingfeedback', 'done'];
    

    columns.forEach(colId => {
        document.getElementById(colId).innerHTML = '';
    });

    tasks.forEach(task => {
        const column = document.getElementById(task.status);
        if (column) {
            column.innerHTML += generateTaskHTML(task);
        }
    });

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
    let contactsHTML = generateContactsHTML(task.assignedContacts);

    return `
    <div draggable="true" ondragstart="startDragging(${task.id})" class="task-card" onclick="openTaskDetails(${task.id})">
        <div class="task-category" style="background-color: ${categoryColor}">${task.category}</div>
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        ${subtasksProgress}
        <div class="task-footer">
            <div class="task-contacts">
                ${contactsHTML}
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

// --- Task Detail Modal ---

function openTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const overlay = document.getElementById('taskDetailOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    modal.classList.remove('large-modal'); // Detail-Ansicht ist schmal
    
    modal.innerHTML = generateTaskDetailHTML(task);
    overlay.classList.remove('d-none');
}

function closeTaskDetails() {
    const overlay = document.getElementById('taskDetailOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    modal.classList.add('slide-out');
    
    setTimeout(() => {
        overlay.classList.add('d-none');
        modal.classList.remove('slide-out');
        modal.innerHTML = '';
    }, 300);
}

function generateTaskDetailHTML(task) {
    let categoryColor = getCategoryColor(task.category);
    let prioIcon = `assets/img/${task.prio}_icon.png`;
    let prioText = task.prio.charAt(0).toUpperCase() + task.prio.slice(1);
    let subtasksHTML = generateSubtaskListDetailHTML(task);
    let assignedContactsHTML = generateAssignedContactsDetailHTML(task.assignedContacts);

    return `
        <div class="task-detail-header">
            <div class="task-detail-category" style="background-color: ${categoryColor}">${task.category}</div>
            <img src="assets/img/cancel_icon.svg" alt="Close" class="close-icon" onclick="closeTaskDetails()">
        </div>

        <h1 class="task-detail-title">${task.title}</h1>
        <p class="task-detail-description">${task.description}</p>

        <div class="task-detail-info-row">
            <span class="task-detail-info-label">Due date:</span>
            <span>${new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
        </div>

        <div class="task-detail-info-row">
            <span class="task-detail-info-label">Priority:</span>
            <div class="task-detail-prio">
                <span>${prioText}</span>
                <img src="${prioIcon}" alt="${task.prio}">
            </div>
        </div>

        <div class="task-detail-info-row column-direction">
            <span class="task-detail-info-label">Assigned To:</span>
            <div class="task-detail-assigned-list">
                ${assignedContactsHTML}
            </div>
        </div>

        <div class="task-detail-info-row column-direction">
            <span class="task-detail-info-label">Subtasks:</span>
            <ul class="task-detail-subtasks-list">
                ${subtasksHTML}
            </ul>
        </div>

        <div class="task-detail-footer">
            <div class="task-detail-btn" onclick="deleteTask(${task.id})">
                <img src="assets/img/delete_icon.svg" alt="Delete">
                <span>Delete</span>
            </div>
            <div class="task-detail-btn" onclick="editTask(${task.id})">
                <img src="assets/img/edit_icon.svg" alt="Edit">
                <span>Edit</span>
            </div>
        </div>
    `;
}

function generateSubtaskListDetailHTML(task) {
    let html = '';
    if (!task.subtasks || task.subtasks.length === 0) {
        return '<li>No subtasks.</li>';
    }
    task.subtasks.forEach((subtask, index) => {
        let checked = subtask.completed ? 'checked' : '';
        html += `
            <li class="task-detail-subtask-item">
                <input type="checkbox" ${checked} onchange="toggleSubtask(${task.id}, ${index})">
                <span>${subtask.title}</span>
            </li>
        `;
    });
    return html;
}

async function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    await localStorage.setItem('tasks', JSON.stringify(tasks));
    closeTaskDetails();
    renderBoard();
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const modal = document.querySelector('#taskDetailOverlay .task-detail-modal');
    loadContacts(); // Kontakte laden für das Dropdown
    modal.classList.add('large-modal'); // Edit-Ansicht ist breit
    
    // Inject Form into existing modal
    modal.innerHTML = `
        <div class="task-detail-header">
            <h1>Edit Task</h1>
            <img src="assets/img/cancel_icon.svg" alt="Close" class="close-icon" onclick="closeTaskDetails()">
        </div>
        <form id="addTaskForm" onsubmit="handleTaskFormSubmit(); return false;">
            ${taskFormTemplate}
        </form>
    `;

    // Setup Edit Mode
    editingTaskId = taskId;
    newTaskStatus = task.status; // Status beibehalten
    populateForm(task);

    // UI Anpassungen für Edit
    const createBtn = modal.querySelector('.btn-create');
    createBtn.innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';
    modal.querySelector('.btn-clear').classList.add('d-none');
}

function openAddTaskModal(status = 'todo') {
    const overlay = document.getElementById('addTaskOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    loadContacts(); // Kontakte laden für das Dropdown
    modal.classList.add('large-modal'); // Add-Ansicht ist breit
    
    // Inject Form
    modal.innerHTML = `
        <div class="task-detail-header">
            <h1>Add Task</h1>
            <img src="assets/img/cancel_icon.svg" alt="Close" class="close-icon" onclick="closeAddTaskModal()">
        </div>
        <form id="addTaskForm" onsubmit="handleTaskFormSubmit(); return false;">
            ${taskFormTemplate}
        </form>
    `;
    
    newTaskStatus = status; // Status setzen (z.B. 'inprogress')
    editingTaskId = null;
    clearTask(); // Formular resetten
    
    overlay.classList.remove('d-none');
}

async function toggleSubtask(taskId, subtaskIndex) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const subtask = tasks[taskIndex].subtasks[subtaskIndex];
        subtask.completed = !subtask.completed;
        await localStorage.setItem('tasks', JSON.stringify(tasks));
                
        renderBoard();
        openTaskDetails(taskId);
    }
}

function closeAddTaskModal() {
    const overlay = document.getElementById('addTaskOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    modal.classList.add('slide-out');
    
    setTimeout(() => {
        overlay.classList.add('d-none');
        modal.classList.remove('slide-out');
        modal.innerHTML = '';
    }, 300);
}

// --- Helper Functions for Contacts ---

function generateContactsHTML(assignedContacts) {
    if (!assignedContacts) return '';
    let html = '';
    assignedContacts.forEach(email => {
        let contact = contacts.find(c => c.email === email);
        if (contact) {
            html += `<div class="contact-badge-board" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>`;
        }
    });
    return html;
}

function generateAssignedContactsDetailHTML(assignedContacts) {
    if (!assignedContacts || assignedContacts.length === 0) return 'No contacts assigned';
    let html = '';
    assignedContacts.forEach(email => {
        let contact = contacts.find(c => c.email === email);
        if (contact) {
            html += `
                <div class="assigned-contact-row">
                    <div class="contact-badge-board" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
                    <span>${contact.name}</span>
                </div>
            `;
        }
    });
    return html;
}