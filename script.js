const phoneForm = document.getElementById('phoneForm');
const loginVerificationForm = document.getElementById('loginVerificationForm');
const messageDiv = document.getElementById('message');
const phoneScreen = document.getElementById('phoneScreen');
const loginVerificationScreen = document.getElementById('loginVerificationScreen');

let currentPhone = '';
let currentUserData = null;

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 4000);
}

async function sendLoginCode(phone) {
    try {
        const formattedPhone = '+972' + phone.substring(1);
        window.confirmationResult = await auth.signInWithPhoneNumber(
            formattedPhone,
            window.recaptchaVerifier
        );
        console.log('SMS נשלח!');
    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה בשליחת SMS! נסה שוב', 'error');
    }
}

phoneForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim().replace(/-/g, '');
    try {
        const usersRef = await db.collection('users').where('phone', '==', phone).get();
        if (usersRef.empty) {
            showMessage('מספר טלפון לא רשום במערכת!', 'error');
            return;
        }
        currentUserData = usersRef.docs[0].data();
        currentPhone = phone;
        await sendLoginCode(phone);
        phoneScreen.classList.add('hidden');
        loginVerificationScreen.classList.remove('hidden');
        showMessage('קוד נשלח!', 'success');
    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה! נסה שוב', 'error');
    }
});

loginVerificationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const enteredCode = document.getElementById('loginCodeInput').value;
    try {
        await window.confirmationResult.confirm(enteredCode);
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
        showMessage('התחברת בהצלחה!', 'success');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('קוד שגוי! נסה שוב', 'error');
        document.getElementById('loginCodeInput').value = '';
    }
});

document.getElementById('resendLoginCode').addEventListener('click', async function() {
    await sendLoginCode(currentPhone);
    showMessage('קוד חדש נשלח!', 'success');
    document.getElementById('loginCodeInput').value = '';
});

document.getElementById('backToPhone').addEventListener('click', function(e) {
    e.preventDefault();
    loginVerificationScreen.classList.add('hidden');
    phoneScreen.classList.remove('hidden');
    phoneForm.reset();
    currentPhone = '';
    currentUserData = null;
});