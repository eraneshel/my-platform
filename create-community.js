const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
}

const createCommunityForm = document.getElementById('createCommunityForm');
const messageDiv = document.getElementById('message');

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 4000);
}

// יצירת קהילה
createCommunityForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const communityName = document.getElementById('communityName').value.trim();
    const communityDescription = document.getElementById('communityDescription').value.trim();
    const communityCategory = document.getElementById('communityCategory').value;
    const communityPrivacy = document.getElementById('communityPrivacy').value;
    const communityRules = document.getElementById('communityRules').value.trim();

    try {
        // יצירת קהילה ב-Firestore
        const newCommunity = {
            name: communityName,
            description: communityDescription,
            category: communityCategory,
            privacy: communityPrivacy,
            rules: communityRules,
            ownerId: currentUser.uid,
            ownerName: `${currentUser.firstName} ${currentUser.lastName}`,
            members: [currentUser.uid],
            createdAt: new Date().toISOString(),
            postsCount: 0,
            membersCount: 1
        };

        await db.collection('communities').add(newCommunity);

        showMessage('הקהילה נוצרה בהצלחה! 🎉', 'success');

        setTimeout(() => {
            window.location.href = 'my-communities.html';
        }, 1500);

    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה ביצירת קהילה! נסה שוב ❌', 'error');
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
        auth.signOut();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

document.querySelector('.nav-logo') && document.querySelector('.nav-logo').addEventListener('click', function() {
    window.location.href = 'home.html';
});