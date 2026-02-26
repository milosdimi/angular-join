let contacts = [];
const colors = ['#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];
let editingContactIndex = null;

async function initContacts() {
    await loadContacts();
    renderContactList();
}

async function loadContacts() {
    try {
        contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    } catch (e) {
        console.error('Could not load contacts', e);
    }
}

function renderContactList() {
    let list = document.getElementById('contactList');
    list.innerHTML = '';

    contacts.sort((a, b) => a.name.localeCompare(b.name));

    let currentLetter = '';

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const firstLetter = contact.name.charAt(0).toUpperCase();

        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            list.innerHTML += `
                <div class="contact-letter">${currentLetter}</div>
                <div class="contact-separator"></div>
            `;
        }

        list.innerHTML += /*html*/`
            <div class="contact-item" onclick="showContactDetails(${i})">
                <div class="contact-avatar" style="background-color: ${contact.color};">${getInitials(contact.name)}</div>
                <div class="contact-info">
                    <span class="contact-name">${contact.name}</span>
                    <a href="mailto:${contact.email}" class="contact-email">${contact.email}</a>
                </div>
            </div>
        `;
    }
}

function getInitials(name) {
    let parts = name.split(' ');
    let initials = parts[0].charAt(0);
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0);
    }
    return initials.toUpperCase();
}

function showContactDetails(index) {
    const contact = contacts[index];
    const content = document.getElementById('contactDetail');

    content.innerHTML = /*html*/`
        <div class="contact-detail-header">
            <div class="contact-avatar-large" style="background-color: ${contact.color};">${getInitials(contact.name)}</div>
            <div class="contact-detail-name-box">
                <span class="contact-detail-name">${contact.name}</span>
                <div class="contact-detail-actions">
                    <div class="action-btn" onclick="openEditContact(${index})"><img src="assets/img/edit_icon.svg" alt=""> Edit</div>
                    <div class="action-btn" onclick="deleteContact(${index})"><img src="assets/img/delete_icon.svg" alt=""> Delete</div>
                </div>
            </div>
        </div>

        <div class="contact-info-headline">Contact Information</div>
        
        <div class="contact-info-box">
            <span class="info-label">Email</span>
            <a href="mailto:${contact.email}" class="info-value-email">${contact.email}</a>
            
            <span class="info-label">Phone</span>
            <a href="tel:${contact.phone}" class="info-value-phone">${contact.phone}</a>
        </div>
    `;
}

function openAddContact() {
    editingContactIndex = null;
    document.getElementById('contactModalTitle').innerText = 'Add contact';
    document.getElementById('contactModalSubmitBtn').innerHTML = 'Create contact <img src="assets/img/check_icon.png" alt="">';

    document.getElementById('contactForm').reset();
    const avatar = document.getElementById('contactModalAvatar');
    avatar.innerHTML = '<img src="assets/img/person.svg" alt="User" class="user-icon-placeholder">';
    avatar.style.backgroundColor = '#D1D1D1';

    document.getElementById('addContactOverlay').classList.remove('d-none');
}

function openEditContact(index) {
    editingContactIndex = index;
    const contact = contacts[index];

    document.getElementById('contactModalTitle').innerText = 'Edit contact';
    document.getElementById('contactModalSubmitBtn').innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';

    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactEmail').value = contact.email;
    document.getElementById('contactPhone').value = contact.phone;

    const avatar = document.getElementById('contactModalAvatar');
    avatar.innerHTML = getInitials(contact.name);
    avatar.style.backgroundColor = contact.color;

    document.getElementById('addContactOverlay').classList.remove('d-none');
}

function closeAddContact() {
    const overlay = document.getElementById('addContactOverlay');
    const card = overlay.querySelector('.add-contact-card');
    card.classList.add('slide-out');

    setTimeout(() => {
        overlay.classList.add('d-none');
        card.classList.remove('slide-out');
    }, 300); 
}

function handleContactFormSubmit() {
    if (editingContactIndex === null) {
        createContact();
    } else {
        saveContact(editingContactIndex);
    }
}

async function createContact() {
    let name = document.getElementById('contactName');
    let email = document.getElementById('contactEmail');
    let phone = document.getElementById('contactPhone');

    contacts.push({
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        color: colors[Math.floor(Math.random() * colors.length)]
    });

    await localStorage.setItem('contacts', JSON.stringify(contacts));
    renderContactList();
    closeAddContact();
}

async function saveContact(index) {
    let name = document.getElementById('contactName').value;
    let email = document.getElementById('contactEmail').value;
    let phone = document.getElementById('contactPhone').value;

    contacts[index].name = name.trim();
    contacts[index].email = email.trim();
    contacts[index].phone = phone.trim();

    await localStorage.setItem('contacts', JSON.stringify(contacts));
    renderContactList();
    showContactDetails(index);
    closeAddContact();
}

async function deleteContact(index) {
    contacts.splice(index, 1);
    await localStorage.setItem('contacts', JSON.stringify(contacts));
    renderContactList();
    document.getElementById('contactDetail').innerHTML = '';
}