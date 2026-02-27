/**
 * Initializes the summary page.
 */
async function initSummary() {
    setGreeting();
    await updateSummaryMetrics();
    checkMobileGreeting();
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

/**
 * Loads tasks and updates the metric cards on the summary page.
 */
async function updateSummaryMetrics() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const animationDuration = 1000; // 1 second for animation

    // Update counts with animation
    animateNumber(document.getElementById('summaryTodo'), tasks.filter(t => t.status === 'todo').length, animationDuration);
    animateNumber(document.getElementById('summaryDone'), tasks.filter(t => t.status === 'done').length, animationDuration);
    animateNumber(document.getElementById('summaryTotal'), tasks.length, animationDuration);
    animateNumber(document.getElementById('summaryInProgress'), tasks.filter(t => t.status === 'inprogress').length, animationDuration);
    animateNumber(document.getElementById('summaryAwaiting'), tasks.filter(t => t.status === 'awaitingfeedback').length, animationDuration);

    // Handle Urgent Tasks
    const urgentTasks = tasks.filter(t => t.prio === 'urgent');
    animateNumber(document.getElementById('summaryUrgent'), urgentTasks.length, animationDuration);

    // Find and display the next upcoming deadline for urgent tasks
    const upcomingUrgentTask = urgentTasks
        .filter(t => new Date(t.dueDate) >= new Date()) // Filter for future or today's dates
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]; // Sort by date and get the first one

    const urgentDateElement = document.getElementById('summaryUrgentDate');
    if (upcomingUrgentTask) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        urgentDateElement.innerText = new Date(upcomingUrgentTask.dueDate).toLocaleDateString('en-US', options);
    } else {
        urgentDateElement.innerText = 'None upcoming';
    }
}

/**
 * Animates a number from 0 to a target value.
 * @param {HTMLElement} element The element to update.
 * @param {number} endValue The final number.
 * @param {number} duration The animation duration in ms.
 */
function animateNumber(element, endValue, duration) {
    if (!element) return;
    let startValue = 0;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        let timeElapsed = currentTime - startTime;
        let progress = Math.min(timeElapsed / duration, 1);
        
        let currentValue = Math.floor(progress * (endValue - startValue) + startValue);
        element.innerText = currentValue;

        if (progress < 1) {
            requestAnimationFrame(animation);
        } else {
            element.innerText = endValue; // Ensure it ends on the exact value
        }
    }

    requestAnimationFrame(animation);
}

/**
 * Handles the mobile greeting animation.
 */
function checkMobileGreeting() {
    // Check if screen width is mobile (< 1000px)
    // AND check if we haven't shown the greeting in this session yet
    if (window.innerWidth < 1000 && !sessionStorage.getItem('mobileGreetingShown')) {
        const overlay = document.getElementById('mobileGreeting');
        if (!overlay) return;
        
        const content = overlay.querySelector('.greeting-content');
        const user = localStorage.getItem('currentUser') || 'Guest';
        const timeText = getTimeGreeting();

        content.innerHTML = `${timeText},<br><span style="color: var(--secondary-color); font-size: 48px;">${user}</span>`;
        
        overlay.classList.remove('d-none');
        
        // Mark as shown in session storage
        sessionStorage.setItem('mobileGreetingShown', 'true');

        // Remove from DOM after animation to enable clicking
        setTimeout(() => {
            overlay.classList.add('d-none');
        }, 3000); // 2s wait + 1s animation
    }
}