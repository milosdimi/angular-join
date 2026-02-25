function guestLogin() {
    localStorage.setItem('currentUser', 'guest');
    window.location.href = 'summary.html';
}

function toggleSignupBtn() {
    const privacyCheckbox = document.getElementById('privacyPolicy');
    const signupBtn = document.getElementById('signupBtn');
    signupBtn.disabled = !privacyCheckbox.checked;
}