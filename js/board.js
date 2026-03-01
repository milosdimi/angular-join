let tasks = [];
let currentDraggedElement;
let taskFormTemplate = ''; 

async function initBoard() {
    await loadTasks();
    await loadContacts(); 
    renderBoard();
    await loadTaskFormTemplate(); 
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
    const searchInput = document.getElementById('searchInput');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    columns.forEach(colId => {
        document.getElementById(colId).innerHTML = '';
    });

    tasks.forEach(task => {
        if (task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search)) {
            const column = document.getElementById(task.status);
            if (column) {
                column.innerHTML += generateTaskHTML(task);
            }
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
    let moveMenuHTML = generateMoveMenuHTML(task);

    return `
    <div draggable="true" ondragstart="startDragging(${task.id})" class="task-card" onclick="openTaskDetails(${task.id})">
        <div class="task-card-header">
            <div class="task-category" style="background-color: ${categoryColor}">${task.category}</div>
            ${moveMenuHTML}
        </div>
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

function generateMoveMenuHTML(task) {
    const statuses = [
        { id: 'todo', label: 'To Do' },
        { id: 'inprogress', label: 'In Progress' },
        { id: 'awaitingfeedback', label: 'Awaiting Feedback' },
        { id: 'done', label: 'Done' }
    ];

    
    let optionsHTML = statuses
        .filter(status => status.id !== task.status)
        .map(status => `
            <div class="move-menu-item" onclick="moveToFromMenu(event, ${task.id}, '${status.id}')">
                ${status.label}
            </div>
        `).join('');

    
    return `
        <div class="move-menu-wrapper">
            <svg class="move-menu-btn" onclick="toggleMoveMenu(event, ${task.id})" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#2A3647"/>
            </svg>
            <div id="move-menu-${task.id}" class="move-menu-dropdown d-none">
                ${optionsHTML}
            </div>
        </div>
    `;
}

function toggleMoveMenu(event, taskId) {
    event.stopPropagation(); 
    let menu = document.getElementById(`move-menu-${taskId}`);
    
    
    document.querySelectorAll('.move-menu-dropdown').forEach(el => {
        if(el.id !== `move-menu-${taskId}`) el.classList.add('d-none');
    });

    menu.classList.toggle('d-none');
}

async function moveToFromMenu(event, taskId, newStatus) {
    event.stopPropagation(); 
    await moveToStatus(taskId, newStatus); 
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
    modal.classList.remove('large-modal'); 
    
    modal.innerHTML = generateTaskDetailHTML(task);
    overlay.classList.remove('d-none');
    document.body.classList.add('no-scroll'); 
}

function closeTaskDetails() {
    const overlay = document.getElementById('taskDetailOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    modal.classList.add('slide-out');
    
    setTimeout(() => {
        overlay.classList.add('d-none');
        modal.classList.remove('slide-out');
        modal.innerHTML = '';
        document.body.classList.remove('no-scroll'); 
    }, 300);
}

function generateTaskDetailHTML(task) {
    let categoryColor = getCategoryColor(task.category);
    let prioIcon = `assets/img/${task.prio}_icon.png`;
    let prioText = task.prio.charAt(0).toUpperCase() + task.prio.slice(1);
    let subtasksHTML = generateSubtaskListDetailHTML(task);
    let assignedContactsHTML = generateAssignedContactsDetailHTML(task.assignedContacts);
    let mobileMoveOptions = generateMobileMoveOptions(task);

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
        
        ${mobileMoveOptions}

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

function generateMobileMoveOptions(task) {
    
    const statuses = [
        { id: 'todo', label: 'To Do' },
        { id: 'inprogress', label: 'In Progress' },
        { id: 'awaitingfeedback', label: 'Awaiting Feedback' },
        { id: 'done', label: 'Done' }
    ];

    
    const options = statuses.filter(s => s.id !== task.status).map(s => `
        <div class="mobile-move-option" onclick="moveToStatus(${task.id}, '${s.id}')">
            Move to ${s.label}
        </div>
    `).join('');

    return `
        <div class="mobile-move-container">
            <span class="task-detail-info-label">Move to:</span>
            <div class="mobile-move-options-list">${options}</div>
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


window.addEventListener('click', function(e) {
    document.querySelectorAll('.move-menu-dropdown').forEach(menu => {
        if (!menu.classList.contains('d-none')) {
            menu.classList.add('d-none');
        }
    });
});

async function moveToStatus(taskId, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        await localStorage.setItem('tasks', JSON.stringify(tasks));
        closeTaskDetails();
        renderBoard();
    }
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
    loadContacts(); 
    modal.classList.add('large-modal'); 
    
   
    modal.innerHTML = `
        <div class="task-detail-header">
            <h1>Edit Task</h1>
            <img src="assets/img/cancel_icon.svg" alt="Close" class="close-icon" onclick="closeTaskDetails()">
        </div>
        <form id="addTaskForm" onsubmit="handleTaskFormSubmit(); return false;" novalidate>
            ${taskFormTemplate}
        </form>
    `;

    // Setup Edit Mode
    editingTaskId = taskId;
    newTaskStatus = task.status;
    populateForm(task);
    setupSubtaskInput(); 

    
    const createBtn = modal.querySelector('.btn-create');
    createBtn.innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';
    modal.querySelector('.btn-clear').classList.add('d-none');
}

function openAddTaskModal(status = 'todo') {
    const overlay = document.getElementById('addTaskOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    loadContacts(); 
    modal.classList.add('large-modal'); 
    
    // Inject Form
    modal.innerHTML = `
        <div class="task-detail-header">
            <h1>Add Task</h1>
            <img src="assets/img/cancel_icon.svg" alt="Close" class="close-icon" onclick="closeAddTaskModal()">
        </div>
        <form id="addTaskForm" onsubmit="handleTaskFormSubmit(); return false;" novalidate>
            ${taskFormTemplate}
        </form>
    `;
    
    newTaskStatus = status; 
    editingTaskId = null;
    clearTask(); 
    setMinDate(); 
    setupSubtaskInput(); 
    
    overlay.classList.remove('d-none');
    document.body.classList.add('no-scroll'); 
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
        document.body.classList.remove('no-scroll'); 
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