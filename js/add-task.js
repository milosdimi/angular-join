let currentPrio = 'medium'; // Default priority
let subtasks = [];
let editingTaskId = null;

/**
 * Initializes the add task page
 */
async function initAddTask() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        editingTaskId = parseInt(id);
        prepareEditMode();
    }
}

async function prepareEditMode() {
    document.querySelector('h1').innerText = 'Edit Task';
    const createBtn = document.querySelector('.btn-create');
    createBtn.innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';
    document.querySelector('.btn-clear').classList.add('d-none'); // Hide clear button in edit mode

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
    // Reset all buttons to their default state
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Activate the selected button
    const selectedButton = document.getElementById(`prio${prio.charAt(0).toUpperCase() + prio.slice(1)}`);
    selectedButton.classList.add('active');

    // Store the selected priority
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
}

function populateForm(task) {
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('dueDate').value = task.dueDate;
    document.getElementById('category').value = task.category;
    setPrio(task.prio);
    subtasks = task.subtasks || [];
    renderSubtasks();
}

function handleTaskFormSubmit() {
    // This function is called by the form's onsubmit event.
    // It prevents the default form submission and calls the appropriate function.
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
    
    // Load existing tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    let newTask = {
        id: new Date().getTime(), // Unique ID for the task
        title: title,
        description: description,
        dueDate: dueDate,
        category: category,
        prio: currentPrio,
        subtasks: subtasks,
        status: 'todo' // Default status for new tasks
    };
    
    // Add the new task and save the updated list
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Show confirmation and redirect
    showTaskAddedMessage();
    setTimeout(() => {
        window.location.href = 'board.html';
    }, 1500);
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
    }

    await localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Redirect back to board
    window.location.href = 'board.html';
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
        // If the input is empty, delete the subtask
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
    msgElement.classList.remove('d-none');
}