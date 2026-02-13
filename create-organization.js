// בדיקה אם המשתמש מחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

// בדיקה אם Super Admin
async function checkSuperAdmin() {
    try {
        const adminDoc = await db.collection('admins').doc(currentUser.email).get();
        if (!adminDoc.exists || adminDoc.data().role !== 'superadmin') {
            alert('אין לך הרשאות גישה לדף זה!');
            window.location.href = 'home.html';
        }
    } catch (error) {
        console.error('שגיאה:', error);
        window.location.href = 'home.html';
    }
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
        maxChannelsPerCommunity: -1
    },
    enterprise: {
        maxCommunities: -1,
        maxMembersPerCommunity: -1,
        maxChannelsPerCommunity: -1
    }
};

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 4000);
}

// יצירת ארגון
createOrgForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const orgName = document.getElementById('orgName').value.trim();
    const orgDescription = document.getElementById('orgDescription').value.trim();
    const orgType = document.getElementById('orgType').value;
    const orgPlan = document.getElementById('orgPlan').value;
    const orgAdminPhone = document.getElementById('orgAdminPhone').value.trim().replace(/-/g, '');

    try {
        // בדיקה אם הטלפון קיים במערכת
        const usersRef = await db.collection('users').where('phone', '==', orgAdminPhone).get();

        if (usersRef.empty) {
            showMessage('משתמש עם טלפון זה לא נמצא במערכת! ⚠️', 'error');
            return;
        }

        const orgAdmin = usersRef.docs[0].data();

        // יצירת ארגון ב-Firestore
        const newOrg = {
            name: orgName,
            description: orgDescription,
            type: orgType,
            plan: orgPlan,
            limits: planLimits[orgPlan],
            adminId: orgAdmin.uid,
            adminName: `${orgAdmin.firstName} ${orgAdmin.lastName}`,
            adminPhone: orgAdminPhone,
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString(),
            communitiesCount: 0,
            status: 'active'
        };

        const orgRef = await db.collection('organizations').add(newOrg);

        // עדכון תפקיד המנהל ב-Firestore
        await db.collection('users').doc(orgAdmin.uid).update({
            role: 'orgadmin',
            organizationId: orgRef.id
        });

        showMessage(`הארגון "${orgName}" נוצר בהצלחה! 🎉`, 'success');
        createOrgForm.reset();

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);

    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה ביצירת ארגון! נסה שוב ❌', 'error');
    }
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

// ניהול ארגונים
document.getElementById('manageOrgs').addEventListener('click', function(e) {
    e.preventDefault();
    alert('ניהול ארגונים יבנה בשלב הבא! 🚧');
});

// טעינה ראשונית
checkSuperAdmin();