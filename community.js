// בדיקה אם המשתמש מחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;

// קבלת ID הקהילה מה-URL
const urlParams = new URLSearchParams(window.location.search);
const communityId = parseInt(urlParams.get('id'));

// טעינת הקהילה
const communities = JSON.parse(localStorage.getItem('communities') || '[]');
const community = communities.find(c => c.id === communityId);

if (!community) {
    alert('קהילה לא נמצאה!');
    window.location.href = 'my-communities.html';
}

const messageDiv = document.getElementById('message');

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 3000);
}

// הצגת פרטי הקהילה
const privacyIcons = {
    'public': '🌐 ציבורי',
    'private': '🔒 פרטי',
    'secret': '🔐 סודי'
};

const categoryNames = {
    'technology': 'טכנולוגיה',
    'sports': 'ספורט',
    'education': 'חינוך',
    'arts': 'אמנות ותרבות',
    'business': 'עסקים',
    'health': 'בריאות',
    'gaming': 'גיימינג',
    'other': 'אחר'
};

document.getElementById('communityName').textContent = community.name;
document.getElementById('communityDescription').textContent = community.description;
document.getElementById('communityPrivacy').textContent = privacyIcons[community.privacy];
document.getElementById('communityCategory').textContent = `📂 ${categoryNames[community.category]}`;
document.getElementById('communityStats').textContent = `👥 ${community.membersCount} חברים • 📝 ${community.postsCount} פוסטים`;

// בדיקה אם המשתמש חבר בקהילה
const isMember = community.members.includes(currentUser.id);
const isOwner = community.ownerId === currentUser.id;

// הצגת כפתורים מתאימים
if (isOwner) {
    document.getElementById('manageBtn').classList.remove('hidden');
} else if (community.privacy === 'public') {
    const joinLeaveBtn = document.getElementById('joinLeaveBtn');
    joinLeaveBtn.classList.remove('hidden');
    
    if (isMember) {
        joinLeaveBtn.textContent = 'עזוב קהילה';
        joinLeaveBtn.classList.add('btn-danger');
    } else {
        joinLeaveBtn.textContent = 'הצטרף לקהילה';
    }
}

// טיפול בהצטרפות/עזיבה
document.getElementById('joinLeaveBtn')?.addEventListener('click', function() {
    const communities = JSON.parse(localStorage.getItem('communities') || '[]');
    const communityIndex = communities.findIndex(c => c.id === communityId);
    
    if (isMember) {
        // עזיבה
        communities[communityIndex].members = communities[communityIndex].members.filter(id => id !== currentUser.id);
        communities[communityIndex].membersCount--;
        showMessage('עזבת את הקהילה', 'success');
        setTimeout(() => window.location.href = 'my-communities.html', 1000);
    } else {
        // הצטרפות
        communities[communityIndex].members.push(currentUser.id);
        communities[communityIndex].membersCount++;
        showMessage('הצטרפת לקהילה! 🎉', 'success');
        setTimeout(() => window.location.reload(), 1000);
    }
    
    localStorage.setItem('communities', JSON.stringify(communities));
});

// הצגת חברים
function displayMembers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const membersList = document.getElementById('membersList');
    
    const memberUsers = users.filter(u => community.members.includes(u.id));
    
    membersList.innerHTML = memberUsers.map(user => {
        const isOwnerBadge = user.id === community.ownerId ? '<span class="owner-badge-small">👑</span>' : '';
        return `
            <div class="member-item">
                <div class="member-avatar">${user.firstName[0]}${user.lastName[0]}</div>
                <div class="member-info">
                    <strong>${user.firstName} ${user.lastName}</strong> ${isOwnerBadge}
                </div>
            </div>
        `;
    }).join('');
}

displayMembers();

// הצגת כללים
if (community.rules && community.rules.trim()) {
    document.getElementById('rulesList').textContent = community.rules;
} else {
    document.getElementById('rulesSection').style.display = 'none';
}

// פוסטים - טעינה והצגה
function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const communityPosts = posts.filter(p => p.communityId === communityId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const postsList = document.getElementById('postsList');
    const noPostsMsg = document.getElementById('noPostsMsg');
    
    if (communityPosts.length === 0) {
        postsList.innerHTML = '';
        noPostsMsg.classList.remove('hidden');
        return;
    }
    
    noPostsMsg.classList.add('hidden');
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    postsList.innerHTML = communityPosts.map(post => {
        const author = users.find(u => u.id === post.authorId);
        const authorName = author ? `${author.firstName} ${author.lastName}` : 'משתמש לא ידוע';
        const timeAgo = getTimeAgo(post.createdAt);
        
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        const postComments = comments.filter(c => c.postId === post.id);
        
        const commentsHTML = postComments.map(comment => {
            const commentAuthor = users.find(u => u.id === comment.authorId);
            const commentAuthorName = commentAuthor ? `${commentAuthor.firstName} ${commentAuthor.lastName}` : 'משתמש';
            return `
                <div class="comment-item">
                    <div class="comment-avatar">${commentAuthor ? commentAuthor.firstName[0] : '?'}</div>
                    <div class="comment-content">
                        <strong>${commentAuthorName}</strong>
                        <p>${comment.content}</p>
                        <small>${getTimeAgo(comment.createdAt)}</small>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-author">
                        <div class="post-avatar">${author ? author.firstName[0] + author.lastName[0] : '??'}</div>
                        <div>
                            <strong>${authorName}</strong>
                            <small>${timeAgo}</small>
                        </div>
                    </div>
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
                <div class="post-actions">
                    <button class="post-action-btn" onclick="toggleComments(${post.id})">
                        💬 ${postComments.length} תגובות
                    </button>
                </div>
                <div id="comments-${post.id}" class="comments-section hidden">
                    <div class="comments-list">
                        ${commentsHTML}
                    </div>
                    <form class="comment-form" onsubmit="addComment(event, ${post.id})">
                        <input type="text" placeholder="כתוב תגובה..." required>
                        <button type="submit" class="btn-primary">שלח</button>
                    </form>
                </div>
            </div>
        `;
    }).join('');
}

// פונקציה לחישוב זמן יחסי
function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'עכשיו';
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return past.toLocaleDateString('he-IL');
}

// הצג/הסתר תגובות
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.classList.toggle('hidden');
}

// הוספת תגובה
function addComment(event, postId) {
    event.preventDefault();
    
    const input = event.target.querySelector('input');
    const content = input.value.trim();
    
    if (!content) return;
    
    const newComment = {
        id: Date.now(),
        postId: postId,
        authorId: currentUser.id,
        content: content,
        createdAt: new Date().toISOString()
    };
    
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));
    
    input.value = '';
    loadPosts();
    showMessage('תגובה נוספה! 💬', 'success');
}

// פרסום פוסט חדש
if (isMember) {
    document.getElementById('newPostForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const content = document.getElementById('postContent').value.trim();
        
        if (!content) return;
        
        const newPost = {
            id: Date.now(),
            communityId: communityId,
            authorId: currentUser.id,
            content: content,
            createdAt: new Date().toISOString()
        };
        
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        posts.push(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // עדכון מספר הפוסטים בקהילה
        const communities = JSON.parse(localStorage.getItem('communities') || '[]');
        const communityIndex = communities.findIndex(c => c.id === communityId);
        communities[communityIndex].postsCount++;
        localStorage.setItem('communities', JSON.stringify(communities));
        
        document.getElementById('postContent').value = '';
        showMessage('הפוסט פורסם! 🎉', 'success');
        loadPosts();
    });
} else {
    document.getElementById('newPostSection').innerHTML = '<p style="text-align: center; color: #999;">הצטרף לקהילה כדי לפרסם</p>';
}

loadPosts();

// כפתורים
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

document.querySelector('.nav-logo').addEventListener('click', function() {
    window.location.href = 'home.html';
});

document.getElementById('manageBtn')?.addEventListener('click', function() {
    alert('ממשק ניהול קהילה יבנה בשלב הבא! 🚧');
});