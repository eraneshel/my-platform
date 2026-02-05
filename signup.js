const signupForm = document.getElementById('signupForm');
const verificationForm = document.getElementById('verificationForm');
const messageDiv = document.getElementById('message');

const signupScreen = document.getElementById('signupScreen');
const verificationScreen = document.getElementById('verificationScreen');
const generatedCodeDiv = document.getElementById('generatedCode');

let currentCode = '';
let pendingUser = null;

// פונקציה להצגת הודעות
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 4000);
}

// פונקציה ליצירת קוד אקראי בן 6 ספרות
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// שליחת קוד (בעתיד יהיה SMS אמיתי)
function sendVerificationCode(phone) {
    currentCode = generateCode();
    
    // כאן בעתיד נשלח SMS אמיתי דרך Twilio/AWS SNS
    console.log(`📱 שולח SMS ל-${phone} עם קוד: ${currentCode}`);
    
    // מציג את הקוד על המסך (רק לפיתוח!)
    generatedCodeDiv.textContent = currentCode;
    
    return currentCode;
}

// פונקציה לבדיקת תאריך תקין
function isValidDate(dateString) {
    // בדיקת פורמט dd/mm/yyyy
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // בדיקה בסיסית
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    
    // בדיקת תאריך תקין (כולל שנה מעוברת)
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

// פונקציה להמרת dd/mm/yyyy ל-Date object
function parseDate(dateString) {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // חודשים מתחילים מ-0
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

// טיפול בשליחת טופס הרישום
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const birthdate = document.getElementById('birthdate').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // בדיקת תקינות תאריך
    if (!isValidDate(birthdate)) {
        showMessage('תאריך לא תקין! השתמש בפורמט dd/mm/yyyy ⚠️', 'error');
        return;
    }
    
    // בדיקה: חייב להיות מעל גיל 13
    const today = new Date();
    const birth = parseDate(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    
    if (age < 13) {
        showMessage('חייבים להיות מעל גיל 13 כדי להירשם! ⚠️', 'error');
        return;
    }
    
    // בדיקה: האם המשתמש כבר קיים? (טלפון או אימייל)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const phoneExists = users.find(user => user.phone === phone);
    const emailExists = users.find(user => user.email === email);
    
    if (phoneExists) {
        showMessage('מספר טלפון זה כבר רשום במערכת! ⚠️', 'error');
        return;
    }
    
    if (emailExists) {
        showMessage('אימייל זה כבר רשום במערכת! ⚠️', 'error');
        return;
    }
    
    // שמירת הנתונים זמנית
    pendingUser = {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        birthdate: birthdate,
        phone: phone,
        createdAt: new Date().toISOString()
    };
    
    // יצירת ושליחת קוד
    sendVerificationCode(phone);
    
    // מעבר למסך אימות
    signupScreen.classList.add('hidden');
    verificationScreen.classList.remove('hidden');
    
    showMessage('קוד נשלח! (בפרודקשן יישלח ב-SMS) 📱', 'success');
});

// טיפול באימות הקוד
verificationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const enteredCode = document.getElementById('codeInput').value;
    
    if (enteredCode === currentCode) {
        // שמירת המשתמש במסד הנתונים
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(pendingUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showMessage(`שלום ${pendingUser.firstName}! נרשמת בהצלחה 🎉`, 'success');
        
        // מעבר לדף התחברות
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } else {
        showMessage('קוד שגוי! נסה שוב ❌', 'error');
        document.getElementById('codeInput').value = '';
    }
});

// שליחת קוד מחדש
document.getElementById('resendCode').addEventListener('click', function() {
    sendVerificationCode(pendingUser.phone);
    showMessage('קוד חדש נשלח! 📱', 'success');
    document.getElementById('codeInput').value = '';
});

// חזרה לרישום
document.getElementById('backToSignup').addEventListener('click', function(e) {
    e.preventDefault();
    verificationScreen.classList.add('hidden');
    signupScreen.classList.remove('hidden');
    signupForm.reset();
    pendingUser = null;
    currentCode = '';
});