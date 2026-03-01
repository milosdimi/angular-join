async function init() {
    await includeHTML();
    checkAuth();
    highlightActiveMenu();
}

async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute("w3-include-html"); 
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

    
    let loginPages = ['index.html', 'signup.html', '/'];
    
    let publicPages = ['privacy-policy.html', 'legal-notice.html', 'help.html'];
    
    // Checks
    let isLoginPage = loginPages.some(page => path.endsWith(page));
    let isPublicPage = publicPages.some(page => path.includes(page));

    
    if (user && isLoginPage) {
        window.location.href = 'summary.html';
        return;
    }
    
    
    if (!user) {
        
        if (!isLoginPage && !isPublicPage) {
            window.location.href = 'index.html';
        } 
        
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

function toggleDropdown() {
    let dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('d-none');
}


window.onclick = function(event) {
    if (!event.target.matches('.profile-icon') && !event.target.closest('.profile-dropdown')) {
        let dropdown = document.getElementById('profileDropdown');
        if (dropdown && !dropdown.classList.contains('d-none')) {
            dropdown.classList.add('d-none');
        }
    }
}