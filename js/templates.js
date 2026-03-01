/**
 * Generates HTML for a single subtask in the list.
 * @param {object} subtask - The subtask object.
 * @param {number} index - The index of the subtask.
 * @returns {string} HTML string.
 */
function generateSubtaskHTML(subtask, index) {
    return /*html*/`
        <li class="subtask-item" id="subtask-${index}">
            <span>• ${subtask.title}</span>
            <div class="subtask-actions">
                <img src="assets/img/edit_icon.svg" onclick="editSubtask(${index})" class="subtask-action-icon">
                <div class="subtask-separator-list"></div>
                <img src="assets/img/delete_icon.svg" onclick="deleteSubtask(${index})" class="subtask-action-icon">
            </div>
        </li>
    `;
}

/**
 * Generates HTML for the subtask edit mode.
 * @param {string} currentTitle - The current title of the subtask.
 * @param {number} index - The index of the subtask.
 * @returns {string} HTML string.
 */
function generateEditSubtaskHTML(currentTitle, index) {
    return /*html*/`
        <div class="subtask-edit-input-wrapper">
            <input type="text" id="edit-subtask-${index}" value="${currentTitle}" onkeydown="if(event.key === 'Enter'){saveSubtask(${index}); return false;}">
            <div class="subtask-edit-actions">
                <img src="assets/img/delete_icon.svg" onclick="deleteSubtask(${index})" class="subtask-action-icon">
                <div class="subtask-separator-list"></div>
                <img src="assets/img/check_icon.png" onclick="saveSubtask(${index})" class="subtask-action-icon">
            </div>
        </div>
    `;
}

/**
 * Generates HTML for a contact option in the dropdown.
 * @param {object} contact - The contact object.
 * @param {number} index - The index of the contact.
 * @param {boolean} isSelected - Whether the contact is selected.
 * @returns {string} HTML string.
 */
function generateContactOptionHTML(contact, index, isSelected) {
    return /*html*/`
        <div class="dropdown-option ${isSelected ? 'selected' : ''}" onclick="toggleContactSelection(${index})">
            <div class="contact-badge" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
            <span>${contact.name}</span>
            <input type="checkbox" ${isSelected ? 'checked' : ''}>
        </div>
    `;
}