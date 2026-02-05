// בדיקה אם המשתמש מחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('welcomeMessage').textContent = `שלום ${currentUser.firstName}! 👋`;
    
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

// חיבור הכפתורים בדף הבית
const cardButtons = document.querySelectorAll('.btn-card');

cardButtons[0].addEventListener('click', function() {
    window.location.href = 'my-communities.html';
});

cardButtons[1].addEventListener('click', function() {
    window.location.href = 'create-community.html';
});

cardButtons[2].addEventListener('click', function() {
    alert('חיפוש קהילות יבנה בשלב הבא! 🚧');
});

cardButtons[3].addEventListener('click', function() {
    alert('הגדרות יבנו בשלב הבא! 🚧');
});

// לוגו מחזיר לדף הבית
document.querySelector('.nav-logo').addEventListener('click', function() {
    window.location.href = 'home.html';
});