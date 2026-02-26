async function init() {
    await includeHTML();
    checkAuth();
    highlightActiveMenu();
}

async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute("w3-include-html"); // 'let' hinzugefügt
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}

function highlightActiveMenu() {
    let url = window.location.pathname;
    let links = document.querySelectorAll('.menu-link');
    links.forEach(link => {
        if (url.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

function checkAuth() {
    let user = localStorage.getItem('currentUser');
    let path = window.location.pathname;

    // Definition der Seiten
    let loginPages = ['index.html', 'signup.html', '/'];
    // Seiten, die jeder sehen darf (auch ohne Login)
    let publicPages = ['privacy-policy.html', 'legal-notice.html', 'help.html'];
    
    // Checks
    let isLoginPage = loginPages.some(page => path.endsWith(page));
    let isPublicPage = publicPages.some(page => path.includes(page));

    // 1. User ist eingeloggt und auf Login-Seite -> Redirect zu Summary
    if (user && isLoginPage) {
        window.location.href = 'summary.html';
        return;
    }
    
    // 2. User ist NICHT eingeloggt
    if (!user) {
        // Auf geschützter Seite (weder Login noch Public) -> Redirect zu Login
        if (!isLoginPage && !isPublicPage) {
            window.location.href = 'index.html';
        } 
        // Auf Public Page (Privacy etc.) -> Sidebar anpassen (Login-Button zeigen)
        else if (isPublicPage) {
            hideSidebarMenu();
        }
    }
}

function hideSidebarMenu() {
    let sidebarNav = document.getElementById('sidebar-nav');
    let sidebarGuest = document.getElementById('sidebar-guest');

    if (sidebarNav) sidebarNav.classList.add('d-none');
    if (sidebarGuest) sidebarGuest.classList.remove('d-none');
}

function logOut() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}