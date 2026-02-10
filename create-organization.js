// בדיקה אם המשתמש מחובר וזה Super Admin
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

// בדיקה אם זה Super Admin (בשלב זה - נניח שהמשתמש הראשון הוא Super Admin)
// בעתיד נוסיף שדה isSuperAdmin למשתמש
const users = JSON.parse(localStorage.getItem('users') || '[]');
const isSuperAdmin = currentUser.id === users[0]?.id; // המשתמש הראשון = Super Admin

if (!isSuperAdmin) {
    alert('אין לך הרשאות גישה לדף זה!');
    window.location.href = 'home.html';
}

// הצגת שם המשתמש
document.getElementById('userFullName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
const initials = currentUser.firstName[0] + currentUser.lastName[0];
document.getElementById('userAvatar').textContent = initials;

const createOrgForm = document.getElementById('createOrgForm');
const messageDiv = document.getElementById('message');

// הגדרת מגבלות החבילות
const planLimits = {
    basic: {
        maxCommunities: 3,
        maxMembersPerCommunity: 50,
        maxChannelsPerCommunity: 1
    },
    premium: {
        maxCommunities: 20,
        maxMembersPerCommunity: 500,
        maxChannelsPerCommunity: -1 // ללא הגבלה
    },
    enterprise: {
        maxCommunities: -1, // ללא הגבלה
        maxMembersPerCommunity: -1, // ללא הגבלה
        maxChannelsPerCommunity: -1 // ללא הגבלה
    }
};

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 4000);
}

// יצירת ארגון
createOrgForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orgName = document.getElementById('orgName').value.trim();
    const orgDescription = document.getElementById('orgDescription').value.trim();
    const orgType = document.getElementById('orgType').value;
    const orgPlan = document.getElementById('orgPlan').value;
    const orgAdminEmail = document.getElementById('orgAdminEmail').value.trim();
    
    // בדיקה: האם האימייל קיים במערכת?
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const orgAdmin = users.find(u => u.email === orgAdminEmail);
    
    if (!orgAdmin) {
        showMessage('משתמש עם אימייל זה לא נמצא במערכת! ⚠️', 'error');
        return;
    }
    
    // יצירת אובייקט ארגון חדש
    const newOrganization = {
        id: Date.now(),
        name: orgName,
        description: orgDescription,
        type: orgType,
        plan: orgPlan,
        limits: planLimits[orgPlan],
        adminId: orgAdmin.id,
        adminName: `${orgAdmin.firstName} ${orgAdmin.lastName}`,
        adminEmail: orgAdmin.email,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        communitiesCount: 0
    };
    
    // שמירת הארגון
    const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
    organizations.push(newOrganization);
    localStorage.setItem('organizations', JSON.stringify(organizations));
    
    showMessage(`הארגון "${orgName}" נוצר בהצלחה! 🎉`, 'success');
    
    // ניקוי הטופס
    createOrgForm.reset();
    
    // אופציונלי: מעבר לדף ניהול ארגונים
    setTimeout(() => {
        // window.location.href = 'manage-organizations.html';
    }, 2000);
});

// כפתור ביטול
document.getElementById('cancelBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח? השינויים לא יישמרו')) {
        window.location.href = 'home.html';
    }
});

// כפתור התנתקות
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

// כפתור ניהול ארגונים (עדיין לא מוכן)
document.getElementById('manageOrgs').addEventListener('click', function(e) {
    e.preventDefault();
    alert('ניהול ארגונים יבנה בשלב הבא! 🚧');
});