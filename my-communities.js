// בדיקה אם המשתמש מחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
}

const communitiesListDiv = document.getElementById('communitiesList');
const emptyStateDiv = document.getElementById('emptyState');

// הצגת הקהילות
function displayCommunities() {
    const communities = JSON.parse(localStorage.getItem('communities') || '[]');
    
    // סינון קהילות שהמשתמש שייך אליהן
    const myCommunities = communities.filter(c => c.members.includes(currentUser.id));
    
    if (myCommunities.length === 0) {
        communitiesListDiv.classList.add('hidden');
        emptyStateDiv.classList.remove('hidden');
        return;
    }
    
    communitiesListDiv.classList.remove('hidden');
    emptyStateDiv.classList.add('hidden');
    
    communitiesListDiv.innerHTML = myCommunities.map(community => {
        const privacyIcons = {
            'public': '🌐',
            'private': '🔒',
            'secret': '🔐'
        };
        
        const privacyNames = {
            'public': 'ציבורי',
            'private': 'פרטי',
            'secret': 'סודי'
        };
        
        const isOwner = community.ownerId === currentUser.id;
        
        return `
            <div class="community-card">
                <div class="community-header">
                    <h3>${community.name}</h3>
                    <span class="privacy-badge">${privacyIcons[community.privacy]} ${privacyNames[community.privacy]}</span>
                </div>
                <p class="community-description">${community.description}</p>
                <div class="community-stats">
                    <span>👥 ${community.membersCount} חברים</span>
                    <span>📝 ${community.postsCount} פוסטים</span>
                    <span>📅 ${new Date(community.createdAt).toLocaleDateString('he-IL')}</span>
                </div>
                ${isOwner ? '<span class="owner-badge">👑 מנהל</span>' : ''}
                <div class="community-actions">
                    <button class="btn-card" onclick="window.location.href='community.html?id=${community.id}'">צפה בקהילה</button>
                    ${isOwner ? '<button class="btn-card" onclick="alert(\'ניהול קהילה יבנה בהמשך!\')">נהל</button>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

displayCommunities();

// כפתור יצירת קהילה חדשה
document.getElementById('createNewBtn').addEventListener('click', function() {
    window.location.href = 'create-community.html';
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