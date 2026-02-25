function guestLogin() {
    localStorage.setItem('currentUser', 'guest');
    window.location.href = 'summary.html';
}