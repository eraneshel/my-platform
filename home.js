// בדיקה אם המשתמש מחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    // הצגת שם המשתמש
    document.getElementById('userFullName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('welcomeMessage').textContent = `שלום ${currentUser.firstName}! 👋`;
    
    // הצגת אות ראשונה באווטאר
    const initials = currentUser.firstName[0] + currentUser.lastName[0];
    document.getElementById('userAvatar').textContent = initials;
    
    // הצגת פרטי משתמש
    const userDetailsDiv = document.getElementById('userDetails');
    userDetailsDiv.innerHTML = `
        <div class="detail-row">
            <strong>שם מלא:</strong> ${currentUser.firstName} ${currentUser.lastName}
        </div>
        <div class="detail-row">
            <strong>אימייל:</strong> ${currentUser.email}
        </div>
        <div class="detail-row">
            <strong>טלפון:</strong> ${currentUser.phone}
        </div>
        <div class="detail-row">
            <strong>תאריך לידה:</strong> ${currentUser.birthdate}
        </div>
        <div class="detail-row">
            <strong>הצטרף בתאריך:</strong> ${new Date(currentUser.createdAt).toLocaleDateString('he-IL')}
        </div>
    `;
}

// כפתור התנתקות
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

// כפתורים שעדיין לא מוכנים
document.getElementById('searchCard').addEventListener('click', function() {
    alert('חיפוש קהילות יבנה בשלב הבא! 🚧');
});

document.getElementById('eventsCard').addEventListener('click', function() {
    alert('מערכת אירועים תבנה בהמשך! 🚧');
});

document.getElementById('notificationsCard').addEventListener('click', function() {
    alert('מערכת התראות תבנה בהמשך! 🚧');
});

document.getElementById('settingsCard').addEventListener('click', function() {
    alert('הגדרות יבנו בהמשך! 🚧');
});

// קישורים בסיידבר
document.getElementById('searchCommunities').addEventListener('click', function(e) {
    e.preventDefault();
    alert('חיפוש קהילות יבנה בשלב הבא! 🚧');
});

document.getElementById('myProfile').addEventListener('click', function(e) {
    e.preventDefault();
    alert('עריכת פרופיל תבנה בהמשך! 🚧');
});

document.getElementById('notifications').addEventListener('click', function(e) {
    e.preventDefault();
    alert('מערכת התראות תבנה בהמשך! 🚧');
});

document.getElementById('settings').addEventListener('click', function(e) {
    e.preventDefault();
    alert('הגדרות יבנו בהמשך! 🚧');
});

document.getElementById('help').addEventListener('click', function(e) {
    e.preventDefault();
    alert('תמיכה תבנה בהמשך! 🚧');
});