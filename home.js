// בדיקה אם המשתמש מחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

let isSuperAdmin = false;

// בדיקה אם Super Admin
async function checkAdminStatus() {
    try {
        const adminDoc = await db.collection('admins').doc(currentUser.email).get();
        if (adminDoc.exists && adminDoc.data().role === 'superadmin') {
            isSuperAdmin = true;
            document.getElementById('adminSection').classList.remove('hidden');
        }
    } catch (error) {
        console.error('שגיאה:', error);
    }
}

// הצגת שם המשתמש
document.getElementById('userFullName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
// עדכון תפקיד בסיידבר
const roleNames = {
    'superadmin': 'מנהל מערכת 👑',
    'orgadmin': 'מנהל ארגון',
    'communityadmin': 'מנהל קהילה',
    'member': 'חבר קהילה'
};
document.querySelector('.user-role').textContent = roleNames[currentUser.role] || 'חבר קהילה';
document.getElementById('welcomeMessage').textContent = `שלום ${currentUser.firstName}! 👋`;

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

// כפתור התנתקות
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        auth.signOut();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

// כפתורים בסיידבר
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

// כרטיסיות
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


document.getElementById('manageUsersCard').addEventListener('click', function() {
    alert('ניהול משתמשים יבנה בהמשך! 🚧');
});

document.getElementById('systemStatsCard').addEventListener('click', function() {
    alert('סטטיסטיקות יבנו בהמשך! 🚧');
});
// טעינה ראשונית
checkAdminStatus();