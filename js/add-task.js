let currentPrio = 'medium'; // Default priority
let subtasks = [];
let editingTaskId = null;
let newTaskStatus = 'todo'; // Standard Status
let contacts = [];
let assignedContacts = [];

/**
 * Initializes the add task page
 */
async function initAddTask() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    await loadContacts();
    setMinDate();
    setupSubtaskInput(); 

    if (id) {
        editingTaskId = parseInt(id);
        prepareEditMode();
    }
}

/**
 * Sets the minimum date for the due date input to today.
 */
function setMinDate() {
    const dateInput = document.getElementById('dueDate');
    if (!dateInput) return;

    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    dateInput.addEventListener('blur', function() {
        if (this.value && this.value < today) {
            this.value = today;
        }
    });
}

async function loadContacts() {
    try {
        contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    } catch (e) {
        console.error('Could not load contacts', e);
    }
}

async function prepareEditMode() {
    document.querySelector('h1').innerText = 'Edit Task';
    const createBtn = document.querySelector('.btn-create');
    createBtn.innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';
    document.querySelector('.btn-clear').classList.add('d-none'); 

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskToEdit = tasks.find(t => t.id === editingTaskId);

    if (taskToEdit) {
        populateForm(taskToEdit);
    }
}

/**
 * Sets the priority for the task and updates the button styles.
 * @param {string} prio - The selected priority ('urgent', 'medium', 'low').
 */
function setPrio(prio) {    
    
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    const selectedButton = document.getElementById(`prio${prio.charAt(0).toUpperCase() + prio.slice(1)}`);
    selectedButton.classList.add('active');

    currentPrio = prio;
}

function clearTask() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('category').value = '';
    document.getElementById('subtask').value = '';
    setPrio('medium');
    subtasks = [];
    document.getElementById('subtaskList').innerHTML = '';
    newTaskStatus = 'todo';
    assignedContacts = [];
    renderSelectedContactsBadges();
}

function populateForm(task) {
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('dueDate').value = task.dueDate;
    document.getElementById('category').value = task.category;
    setPrio(task.prio);
    subtasks = task.subtasks || [];
    assignedContacts = task.assignedContacts || [];
    renderSelectedContactsBadges();
    renderSubtasks();
}

function validateTaskForm() {
    let isValid = true;
    const title = document.getElementById('title');
    const date = document.getElementById('dueDate');
    const category = document.getElementById('category');

    if (!title.value.trim()) {
        title.classList.add('error-border');
        isValid = false;
    } else {
        title.classList.remove('error-border');
    }

    if (!date.value) {
        date.classList.add('error-border');
        isValid = false;
    } else {
        date.classList.remove('error-border');
    }

    if (!category.value) {
        category.classList.add('error-border');
        isValid = false;
    } else {
        category.classList.remove('error-border');
    }
    
    return isValid;
}

function handleTaskFormSubmit() {
    if (!validateTaskForm()) return false; 

    if (editingTaskId !== null) {
        saveEditedTask();
    } else {
        createTask();
    }
    return false; 
}

async function createTask() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('dueDate').value;
    let category = document.getElementById('category').value;
    

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    let newTask = {
        id: new Date().getTime(), 
        title: title,
        description: description,
        dueDate: dueDate,
        category: category,
        prio: currentPrio,
        subtasks: subtasks,
        status: newTaskStatus,
        assignedContacts: assignedContacts
    };
    

    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    

    showTaskAddedMessage();
    
    if (window.location.pathname.includes('board.html')) {
        setTimeout(async () => {
            closeAddTaskModal();
            await loadTasks(); 
            renderBoard();
        }, 1000);
    } else {
        setTimeout(() => {
            window.location.href = 'board.html';
        }, 1500);
    }
}

async function saveEditedTask() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === editingTaskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].title = document.getElementById('title').value;
        tasks[taskIndex].description = document.getElementById('description').value;
        tasks[taskIndex].dueDate = document.getElementById('dueDate').value;
        tasks[taskIndex].category = document.getElementById('category').value;
        tasks[taskIndex].prio = currentPrio;
        tasks[taskIndex].subtasks = subtasks;
        tasks[taskIndex].assignedContacts = assignedContacts;
    }

    await localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Redirect back to board
    if (window.location.pathname.includes('board.html')) {
        closeTaskDetails(); 
        await loadTasks(); 
        renderBoard();
    } else {
        window.location.href = 'board.html';
    }
}

function setupSubtaskInput() {
    const input = document.getElementById('subtask');
    if (input) {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                addSubtask();
            }
        });
    }
}

function addSubtask() {
    let input = document.getElementById('subtask');
    if (input.value.length > 0) {
        subtasks.push({
            title: input.value,
            completed: false
        });
        input.value = '';
        renderSubtasks();
    }
}

function renderSubtasks() {
    let list = document.getElementById('subtaskList');
    list.innerHTML = '';
    
    for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        list.innerHTML += /*html*/`
            <li class="subtask-item" id="subtask-${i}">
                <span>• ${subtask.title}</span>
                <div class="subtask-actions">
                    <img src="assets/img/edit_icon.svg" onclick="editSubtask(${i})" class="subtask-action-icon">
                    <div class="subtask-separator-list"></div>
                    <img src="assets/img/delete_icon.svg" onclick="deleteSubtask(${i})" class="subtask-action-icon">
                </div>
            </li>
        `;
    }
}

function editSubtask(index) {
    let subtaskItem = document.getElementById(`subtask-${index}`);
    let currentTitle = subtasks[index].title;
    
    subtaskItem.classList.add('editing');
    subtaskItem.innerHTML = /*html*/`
        <div class="subtask-edit-input-wrapper">
            <input type="text" id="edit-subtask-${index}" value="${currentTitle}" onkeydown="if(event.key === 'Enter'){saveSubtask(${index}); return false;}">
            <div class="subtask-edit-actions">
                <img src="assets/img/delete_icon.svg" onclick="deleteSubtask(${index})" class="subtask-action-icon">
                <div class="subtask-separator-list"></div>
                <img src="assets/img/check_icon.png" onclick="saveSubtask(${index})" class="subtask-action-icon">
            </div>
        </div>
    `;
    document.getElementById(`edit-subtask-${index}`).focus();
}

function saveSubtask(index) {
    let input = document.getElementById(`edit-subtask-${index}`);
    if (input.value.length > 0) {
        subtasks[index].title = input.value;
    } else {
        
        subtasks.splice(index, 1);
    }
    renderSubtasks();
}

function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}

function clearSubtaskInput() {
    document.getElementById('subtask').value = '';
}

function showTaskAddedMessage() {
    const msgElement = document.getElementById('taskAddedMsg');
    if (msgElement) {
        msgElement.classList.remove('d-none');
    }
}

// --- CONTACTS DROPDOWN LOGIC ---

function toggleContactsDropdown(event) {
    if(event) event.stopPropagation();
    const options = document.getElementById('dropdownOptions');
    options.classList.toggle('d-none');
    
    if (!options.classList.contains('d-none')) {
        renderContactsDropdown();
        
        document.addEventListener('click', closeDropdownOnClickOutside, true);
    } else {
        document.removeEventListener('click', closeDropdownOnClickOutside, true);
    }
}

function closeDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('dropdownAssigned');
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById('dropdownOptions').classList.add('d-none');
        document.removeEventListener('click', closeDropdownOnClickOutside, true);
    }
}

function renderContactsDropdown() {
    const container = document.getElementById('dropdownOptions');
    container.innerHTML = '';
    
    contacts.forEach((contact, index) => {
        const isSelected = assignedContacts.includes(contact.email);
        container.innerHTML += /*html*/`
            <div class="dropdown-option ${isSelected ? 'selected' : ''}" onclick="toggleContactSelection(${index})">
                <div class="contact-badge" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
                <span>${contact.name}</span>
                <input type="checkbox" ${isSelected ? 'checked' : ''}>
            </div>
        `;
    });
}

function toggleContactSelection(index) {
    const contact = contacts[index];
    const contactIndex = assignedContacts.indexOf(contact.email);
    
    if (contactIndex === -1) {
        assignedContacts.push(contact.email);
    } else {
        assignedContacts.splice(contactIndex, 1);
    }
    renderContactsDropdown();
    renderSelectedContactsBadges();
}

function renderSelectedContactsBadges() {
    const container = document.getElementById('selectedContactsContainer');
    container.innerHTML = '';
    
    assignedContacts.forEach(email => {
        const contact = contacts.find(c => c.email === email);
        if (contact) {
            container.innerHTML += `<div class="contact-badge-small" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>`;
        }
    });
}

function getInitials(name) {
    let parts = name.split(' ');
    let initials = parts[0].charAt(0);
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0);
    }
    return initials.toUpperCase();
}