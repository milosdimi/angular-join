let currentPrio = 'medium'; // Default priority
let subtasks = [];

/**
 * Initializes the add task page
 */
function initAddTask() {
    // Placeholder for initialization logic
    // In the future, we can load contacts here, for example.
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