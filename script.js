const phoneForm = document.getElementById('phoneForm');
const loginVerificationForm = document.getElementById('loginVerificationForm');
const messageDiv = document.getElementById('message');

const phoneScreen = document.getElementById('phoneScreen');
const loginVerificationScreen = document.getElementById('loginVerificationScreen');
const loginCodeDiv = document.getElementById('loginCode');

let currentLoginCode = '';
let currentPhone = '';

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 4000);
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendLoginCode(phone) {
    currentLoginCode = generateCode();
    console.log(`📱 שולח SMS ל-${phone} עם קוד: ${currentLoginCode}`);
    loginCodeDiv.textContent = currentLoginCode;
    return currentLoginCode;
}

// שליחת קוד התחברות
phoneForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phone = document.getElementById('phone').value.trim();
    
    // בדיקה: האם המשתמש קיים?
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phone);
    
    if (!user) {
        showMessage('מספר טלפון לא רשום במערכת! ⚠️', 'error');
        return;
    }
    
    currentPhone = phone;
    sendLoginCode(phone);
    
    phoneScreen.classList.add('hidden');
    loginVerificationScreen.classList.remove('hidden');
    
    showMessage('קוד נשלח! (בפרודקשן יישלח ב-SMS) 📱', 'success');
});

// אימות קוד התחברות
loginVerificationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const enteredCode = document.getElementById('loginCodeInput').value;
    
    if (enteredCode === currentLoginCode) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.phone === currentPhone);
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showMessage(`שלום ${user.firstName}! התחברת בהצלחה 🎉`, 'success');
        
        // מעבר לדף הבית
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

// חזרה להזנת טלפון
document.getElementById('backToPhone').addEventListener('click', function(e) {
    e.preventDefault();
    loginVerificationScreen.classList.add('hidden');
    phoneScreen.classList.remove('hidden');
    phoneForm.reset();
    currentPhone = '';
    currentLoginCode = '';
});