// Get the reminder textarea
const reminderTextarea = document.querySelector('.reminder-box textarea');

// Load reminder from local storage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedReminder = localStorage.getItem('reminder');
    if (savedReminder) {
        reminderTextarea.value = savedReminder;
    }
});

// Save reminder to local storage when the textarea changes
reminderTextarea.addEventListener('input', () => {
    localStorage.setItem('reminder', reminderTextarea.value);
});
