// בדיקה אם המשתמש מחובר
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
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 4000);
}

// יצירת קהילה
createCommunityForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const communityName = document.getElementById('communityName').value.trim();
    const communityDescription = document.getElementById('communityDescription').value.trim();
    const communityCategory = document.getElementById('communityCategory').value;
    const communityPrivacy = document.getElementById('communityPrivacy').value;
    const communityRules = document.getElementById('communityRules').value.trim();
    
    // יצירת אובייקט קהילה חדשה
    const newCommunity = {
        id: Date.now(),
        name: communityName,
        description: communityDescription,
        category: communityCategory,
        privacy: communityPrivacy,
        rules: communityRules,
        ownerId: currentUser.id,
        ownerName: `${currentUser.firstName} ${currentUser.lastName}`,
        members: [currentUser.id], // היוצר הוא החבר הראשון
        createdAt: new Date().toISOString(),
        postsCount: 0,
        membersCount: 1
    };
    
    // שמירת הקהילה
    const communities = JSON.parse(localStorage.getItem('communities') || '[]');
    communities.push(newCommunity);
    localStorage.setItem('communities', JSON.stringify(communities));
    
    showMessage('הקהילה נוצרה בהצלחה! 🎉', 'success');
    
    // מעבר לדף הקהילות שלי
    setTimeout(() => {
        window.location.href = 'my-communities.html';
    }, 1500);
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

document.querySelector('.nav-logo').addEventListener('click', function() {
    window.location.href = 'home.html';
});