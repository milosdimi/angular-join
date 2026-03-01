let users = [];

async function loadUsers() {
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
    } catch (e) {
        console.error('Could not load users', e);
    }
}

function guestLogin() {
    localStorage.setItem('currentUser', 'guest');
    window.location.href = 'summary.html';
}

function initSignup() {
    // Dummy User Data
    document.getElementById('name').value = 'Guest User';
    document.getElementById('email').value = 'guest@email.com';
    document.getElementById('password').value = '123456';
    document.getElementById('confirmPassword').value = '123456';
    updatePasswordIcon('password');
    updatePasswordIcon('confirmPassword');
    
    toggleSignupBtn();
}

function toggleSignupBtn() {
    const privacyCheckbox = document.getElementById('privacyPolicy');
    const signupBtn = document.getElementById('signupBtn');
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (privacyCheckbox.checked && password.length > 0 && password === confirmPassword) {
        signupBtn.disabled = false;
    } else {
        signupBtn.disabled = true;
    }
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const msgBox = document.getElementById('msgBox');
    const confirmInput = document.getElementById('confirmPassword');

    if (password !== confirmPassword && confirmPassword.length > 0) {
        msgBox.classList.remove('d-none');
        confirmInput.style.borderColor = '#FF8190';
    } else {
        msgBox.classList.add('d-none');
        confirmInput.style.borderColor = '#D1D1D1';
    }
    toggleSignupBtn();
}

function updatePasswordIcon(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;

    if (input.value.length === 0) {
        icon.src = 'assets/img/lock_icon.png';
        input.type = 'password';
    } else {
        
        if (icon.src.includes('lock_icon.png')) {
            icon.src = 'assets/img/invisible.png';
        }
    }
}

function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.value.length === 0) return; 

    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    icon.src = type === 'password' ? 'assets/img/invisible.png' : 'assets/img/visible.png';
}

async function register() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    await loadUsers();
    
    
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        alert('User already exists!');
        return;
    }

    users.push({ name: name, email: email, password: password });
    await localStorage.setItem('users', JSON.stringify(users));
    

    localStorage.setItem('currentUser', name);
    window.location.href = 'summary.html';
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgBox = document.getElementById('msgBox');

    await loadUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', user.name);
        window.location.href = 'summary.html';
    } else {
        if (msgBox) msgBox.classList.remove('d-none');
    }
}