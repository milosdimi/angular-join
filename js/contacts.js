function initContacts() {
    console.log("Contacts initialized");
}

function openAddContact() {
    document.getElementById('addContactOverlay').classList.remove('d-none');
}

function closeAddContact() {
    document.getElementById('addContactOverlay').classList.add('d-none');
}

function createContact() {
    console.log("Create contact...");
    closeAddContact();
}