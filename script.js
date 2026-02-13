const phoneForm = document.getElementById('phoneForm');
const loginVerificationForm = document.getElementById('loginVerificationForm');
const messageDiv = document.getElementById('message');
const phoneScreen = document.getElementById('phoneScreen');
const loginVerificationScreen = document.getElementById('loginVerificationScreen');
const loginCodeDiv = document.getElementById('loginCode');

let currentLoginCode = '';
let currentPhone = '';
let currentUserData = null;

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 4000);
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendLoginCode(phone) {
    currentLoginCode = generateCode();
    console.log(`📱 קוד לטלפון ${phone}: ${currentLoginCode}`);
    loginCodeDiv.textContent = currentLoginCode;
    return currentLoginCode;
}

// שליחת קוד התחברות
phoneForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim().replace(/-/g, '');

    try {
        const usersRef = await db.collection('users').where('phone', '==', phone).get();

        if (usersRef.empty) {
            showMessage('מספר טלפון לא רשום במערכת! ⚠️', 'error');
            return;
        }

        currentUserData = usersRef.docs[0].data();
        currentPhone = phone;
        sendLoginCode(phone);
        phoneScreen.classList.add('hidden');
        loginVerificationScreen.classList.remove('hidden');
        showMessage('קוד נשלח! 📱', 'success');

    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה! נסה שוב ❌', 'error');
    }
});

// אימות קוד
loginVerificationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const enteredCode = document.getElementById('loginCodeInput').value;

    if (enteredCode === currentLoginCode) {
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
        showMessage(`שלום ${currentUserData.firstName}! התחברת בהצלחה 🎉`, 'success');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    } else {
        showMessage('קוד שגוי! נסה שוב ❌', 'error');
        document.getElementById('loginCodeInput').value = '';
    }
});

// שליחת קוד מחדש
document.getElementById('resendLoginCode').addEventListener('click', function() {
    sendLoginCode(currentPhone);
    showMessage('קוד חדש נשלח! 📱', 'success');
    document.getElementById('loginCodeInput').value = '';
});

// חזרה
document.getElementById('backToPhone').addEventListener('click', function(e) {
    e.preventDefault();
    loginVerificationScreen.classList.add('hidden');
    phoneScreen.classList.remove('hidden');
    phoneForm.reset();
    currentPhone = '';
    currentLoginCode = '';
    currentUserData = null;
});