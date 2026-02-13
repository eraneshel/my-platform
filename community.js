const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;

// קבלת ID הקהילה מה-URL
const urlParams = new URLSearchParams(window.location.search);
const communityId = urlParams.get('id');

const messageDiv = document.getElementById('message');

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 3000);
}

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

let community = null;
let isMember = false;
let isOwner = false;

// טעינת הקהילה
async function loadCommunity() {
    try {
        const doc = await db.collection('communities').doc(communityId).get();

        if (!doc.exists) {
            alert('קהילה לא נמצאה!');
            window.location.href = 'my-communities.html';
            return;
        }

        community = { id: doc.id, ...doc.data() };
        isMember = community.members.includes(currentUser.uid);
        isOwner = community.ownerId === currentUser.uid;

        // הצגת פרטי הקהילה
        document.getElementById('communityName').textContent = community.name;
        document.getElementById('communityDescription').textContent = community.description;
        document.getElementById('communityPrivacy').textContent = privacyIcons[community.privacy];
        document.getElementById('communityCategory').textContent = `📂 ${categoryNames[community.category]}`;
        document.getElementById('communityStats').textContent = `👥 ${community.membersCount} חברים • 📝 ${community.postsCount} פוסטים`;

        // כפתורים
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

        // כללים
        if (community.rules && community.rules.trim()) {
            document.getElementById('rulesList').textContent = community.rules;
        } else {
            document.getElementById('rulesSection').style.display = 'none';
        }

        // טעינת חברים ופוסטים
        await loadMembers();
        await loadPosts();

    } catch (error) {
        console.error('שגיאה:', error);
    }
}

// טעינת חברים
async function loadMembers() {
    try {
        const membersList = document.getElementById('membersList');
        const membersData = [];

        for (const memberId of community.members) {
            const userDoc = await db.collection('users').doc(memberId).get();
            if (userDoc.exists) {
                membersData.push(userDoc.data());
            }
        }

        membersList.innerHTML = membersData.map(user => {
            const isOwnerBadge = user.uid === community.ownerId ? '<span class="owner-badge-small">👑</span>' : '';
            return `
                <div class="member-item">
                    <div class="member-avatar">${user.firstName[0]}${user.lastName[0]}</div>
                    <div class="member-info">
                        <strong>${user.firstName} ${user.lastName}</strong> ${isOwnerBadge}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('שגיאה בטעינת חברים:', error);
    }
}

// טעינת פוסטים
async function loadPosts() {
    try {
        const snapshot = await db.collection('posts')
            .where('communityId', '==', communityId)
            .orderBy('createdAt', 'desc')
            .get();

        const postsList = document.getElementById('postsList');
        const noPostsMsg = document.getElementById('noPostsMsg');

        if (snapshot.empty) {
            postsList.innerHTML = '';
            noPostsMsg.classList.remove('hidden');
            return;
        }

        noPostsMsg.classList.add('hidden');

        const postsHTML = await Promise.all(snapshot.docs.map(async doc => {
            const post = { id: doc.id, ...doc.data() };

            // טעינת פרטי המחבר
            const authorDoc = await db.collection('users').doc(post.authorId).get();
            const author = authorDoc.exists ? authorDoc.data() : null;
            const authorName = author ? `${author.firstName} ${author.lastName}` : 'משתמש לא ידוע';

            // טעינת תגובות
            const commentsSnapshot = await db.collection('comments')
                .where('postId', '==', post.id)
                .orderBy('createdAt', 'asc')
                .get();

            const commentsHTML = await Promise.all(commentsSnapshot.docs.map(async commentDoc => {
                const comment = { id: commentDoc.id, ...commentDoc.data() };
                const commentAuthorDoc = await db.collection('users').doc(comment.authorId).get();
                const commentAuthor = commentAuthorDoc.exists ? commentAuthorDoc.data() : null;
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
            }));

            return `
                <div class="post-card">
                    <div class="post-header">
                        <div class="post-author">
                            <div class="post-avatar">${author ? author.firstName[0] + author.lastName[0] : '??'}</div>
                            <div>
                                <strong>${authorName}</strong>
                                <small>${getTimeAgo(post.createdAt)}</small>
                            </div>
                        </div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-actions">
                        <button class="post-action-btn" onclick="toggleComments('${post.id}')">
                            💬 ${commentsSnapshot.size} תגובות
                        </button>
                    </div>
                    <div id="comments-${post.id}" class="comments-section hidden">
                        <div class="comments-list">
                            ${commentsHTML.join('')}
                        </div>
                        ${isMember ? `
                        <form class="comment-form" onsubmit="addComment(event, '${post.id}')">
                            <input type="text" placeholder="כתוב תגובה..." required>
                            <button type="submit" class="btn-primary">שלח</button>
                        </form>
                        ` : ''}
                    </div>
                </div>
            `;
        }));

        postsList.innerHTML = postsHTML.join('');

    } catch (error) {
        console.error('שגיאה בטעינת פוסטים:', error);
    }
}

// הצג/הסתר תגובות
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.classList.toggle('hidden');
}

// הוספת תגובה
async function addComment(event, postId) {
    event.preventDefault();

    const input = event.target.querySelector('input');
    const content = input.value.trim();

    if (!content) return;

    try {
        await db.collection('comments').add({
            postId,
            authorId: currentUser.uid,
            content,
            createdAt: new Date().toISOString()
        });

        input.value = '';
        await loadPosts();
        showMessage('תגובה נוספה! 💬', 'success');

    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה בהוספת תגובה ❌', 'error');
    }
}

// פרסום פוסט חדש
if (document.getElementById('newPostForm')) {
    document.getElementById('newPostForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!isMember) return;

        const content = document.getElementById('postContent').value.trim();
        if (!content) return;

        try {
            await db.collection('posts').add({
                communityId,
                authorId: currentUser.uid,
                content,
                createdAt: new Date().toISOString()
            });

            // עדכון מספר פוסטים
            await db.collection('communities').doc(communityId).update({
                postsCount: firebase.firestore.FieldValue.increment(1)
            });

            document.getElementById('postContent').value = '';
            showMessage('הפוסט פורסם! 🎉', 'success');
            await loadPosts();

        } catch (error) {
            console.error('שגיאה:', error);
            showMessage('שגיאה בפרסום פוסט ❌', 'error');
        }
    });
}

// הצטרפות/עזיבה
document.getElementById('joinLeaveBtn')?.addEventListener('click', async function() {
    try {
        if (isMember) {
            await db.collection('communities').doc(communityId).update({
                members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
                membersCount: firebase.firestore.FieldValue.increment(-1)
            });
            showMessage('עזבת את הקהילה', 'success');
            setTimeout(() => window.location.href = 'my-communities.html', 1000);
        } else {
            await db.collection('communities').doc(communityId).update({
                members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
                membersCount: firebase.firestore.FieldValue.increment(1)
            });
            showMessage('הצטרפת לקהילה! 🎉', 'success');
            setTimeout(() => window.location.reload(), 1000);
        }
    } catch (error) {
        console.error('שגיאה:', error);
    }
});

// כפתורים
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        auth.signOut();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

document.querySelector('.nav-logo').addEventListener('click', function() {
    window.location.href = 'home.html';
});

document.getElementById('manageBtn')?.addEventListener('click', function() {
    alert('ניהול קהילה יבנה בהמשך! 🚧');
});

// טעינה ראשונית
loadCommunity();