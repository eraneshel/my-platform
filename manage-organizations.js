const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', async function() {

    document.getElementById('userFullName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('userAvatar').textContent = currentUser.firstName[0] + currentUser.lastName[0];

    async function loadOrganizations() {
        try {
            const snapshot = await db.collection('organizations').orderBy('createdAt', 'desc').get();
            const orgsList = document.getElementById('orgsList');
            const emptyState = document.getElementById('emptyState');

            if (snapshot.empty) {
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            orgsList.innerHTML = snapshot.docs.map(doc => {
                const org = { id: doc.id, ...doc.data() };
                return `
                    <div class="org-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:white;border-radius:10px;margin-bottom:10px;cursor:pointer;box-shadow:0 2px 5px rgba(0,0,0,0.1)" onclick="window.location.href='edit-organization.html?id=${org.id}'">
                        <span style="font-size:16px;font-weight:600">${org.name}</span>
                        <span style="color:#667eea">→</span>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('שגיאה:', error);
        }
    }

    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });

    loadOrganizations();
});