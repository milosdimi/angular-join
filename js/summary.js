/**
 * Initializes the summary page.
 */
function initSummary() {
    setGreeting();
}


/**
 * Sets the greeting text based on time and user status.
 */
function setGreeting() {
    let greetingElement = document.querySelector('.greeting-text');
    let nameElement = document.querySelector('.greeting-name');
    let user = localStorage.getItem('currentUser');
    let timeText = getTimeGreeting();

    if (user === 'guest') {
        greetingElement.innerHTML = `${timeText}!`;
        nameElement.innerHTML = '';
    } else {
        greetingElement.innerHTML = `${timeText},`;
        nameElement.innerHTML = user || 'User';
    }
}


/**
 * Returns the greeting string based on the current hour.
 * @returns {string} The appropriate greeting.
 */
function getTimeGreeting() {
    let hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    } else if (hour < 18) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
}