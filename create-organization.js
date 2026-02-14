const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

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

document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;

const planLimits = {
    basic: { maxCommunities: 3, maxMembersPerCommunity: 50, maxChannelsPerCommunity: 1 },
    premium: { maxCommunities: 20, maxMembersPerCommunity: 500, maxChannelsPerCommunity: -1 },
    enterprise: { maxCommunities: -1, maxMembersPerCommunity: -1, maxChannelsPerCommunity: -1 }
};

const messageDiv = document.getElementById('message');

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 5000);
}

document.getElementById('createOrgForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const orgName = document.getElementById('orgName').value.trim();
    const orgDescription = document.getElementById('orgDescription').value.trim();
    const orgType = document.getElementById('orgType').value;
    const orgPlan = document.getElementById('orgPlan').value;

    const billingName = document.getElementById('billingName').value.trim();
    const billingEmail = document.getElementById('billingEmail').value.trim();
    const billingPhone = document.getElementById('billingPhone').value.trim().replace(/-/g, '');
    const billingAddress = document.getElementById('billingAddress').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;
    const billingCycle = document.getElementById('billingCycle').value;
    const billingStartDate = document.getElementById('billingStartDate').value;

    const adminFirstName = document.getElementById('adminFirstName').value.trim();
    const adminLastName = document.getElementById('adminLastName').value.trim();
    const adminPhone = document.getElementById('adminPhone').value.trim().replace(/-/g, '');
    const adminEmail = document.getElementById('adminEmail').value.trim();

    try {
        // בדיקה אם מנהל כבר קיים
        let adminUser = null;
        const userCheck = await db.collection('users').where('phone', '==', adminPhone).get();

        if (!userCheck.empty) {
            // משתמש קיים - עדכן תפקיד
            adminUser = userCheck.docs[0].data();
            await db.collection('users').doc(adminUser.uid).update({
                role: 'orgadmin'
            });
        } else {
            // משתמש לא קיים - צור חדש
            const newUserRef = db.collection('users').doc();
            adminUser = {
                uid: newUserRef.id,
                firstName: adminFirstName,
                lastName: adminLastName,
                phone: adminPhone,
                email: adminEmail,
                role: 'orgadmin',
                createdAt: new Date().toISOString()
            };
            await newUserRef.set(adminUser);
        }

        // יצירת ארגון
        const newOrg = {
            name: orgName,
            description: orgDescription,
            type: orgType,
            plan: orgPlan,
            limits: planLimits[orgPlan],
            billing: {
                name: billingName,
                email: billingEmail,
                phone: billingPhone,
                address: billingAddress,
                paymentMethod: paymentMethod,
                cycle: billingCycle,
                startDate: billingStartDate
            },
            adminId: adminUser.uid,
            adminName: `${adminFirstName} ${adminLastName}`,
            adminPhone: adminPhone,
            adminEmail: adminEmail,
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString(),
            communitiesCount: 0,
            status: 'active'
        };

        const orgRef = await db.collection('organizations').add(newOrg);

        // עדכון organizationId למנהל
        await db.collection('users').doc(adminUser.uid).update({
            organizationId: orgRef.id
        });

        showMessage(`הארגון "${orgName}" נוצר בהצלחה! 🎉`, 'success');
        document.getElementById('createOrgForm').reset();

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);

    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה ביצירת ארגון! נסה שוב ❌', 'error');
    }
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח? השינויים לא יישמרו')) {
        window.location.href = 'home.html';
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

checkSuperAdmin();