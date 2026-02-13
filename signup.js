const signupForm = document.getElementById('signupForm');
const verificationForm = document.getElementById('verificationForm');
const messageDiv = document.getElementById('message');

const signupScreen = document.getElementById('signupScreen');
const verificationScreen = document.getElementById('verificationScreen');
const generatedCodeDiv = document.getElementById('generatedCode');

let currentCode = '';
let pendingUser = null;

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 4000);
}

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendVerificationCode(phone) {
    currentCode = generateCode();
    console.log(`📱 קוד לטלפון ${phone}: ${currentCode}`);
    generatedCodeDiv.textContent = currentCode;
    return currentCode;
}

function isValidDate(dateString) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

function parseDate(dateString) {
    const parts = dateString.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

// טיפול בשליחת טופס הרישום
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const birthdate = document.getElementById('birthdate').value.trim();
    const phone = document.getElementById('phone').value.trim().replace(/-/g, '');

    // בדיקת תאריך
    if (!isValidDate(birthdate)) {
        showMessage('תאריך לא תקין! השתמש בפורמט dd/mm/yyyy ⚠️', 'error');
        return;
    }

    // בדיקת גיל
    const today = new Date();
    const birth = parseDate(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 || 
        (today.getMonth() - birth.getMonth() === 0 && today.getDate() - birth.getDate() < 0)) {
        age--;
    }
    if (age < 13) {
        showMessage('חייבים להיות מעל גיל 13 ⚠️', 'error');
        return;
    }

    try {
        // בדיקה אם הטלפון כבר קיים ב-Firestore
        const phoneCheck = await db.collection('users').where('phone', '==', phone).get();
        if (!phoneCheck.empty) {
            showMessage('מספר טלפון זה כבר רשום במערכת! ⚠️', 'error');
            return;
        }

        // בדיקה אם האימייל כבר קיים ב-Firestore
        const emailCheck = await db.collection('users').where('email', '==', email).get();
        if (!emailCheck.empty) {
            showMessage('אימייל זה כבר רשום במערכת! ⚠️', 'error');
            return;
        }

        // רשימת Super Admins
const SUPER_ADMINS = ['eraneshel33@sn.ort.org.il'];

pendingUser = {
    firstName, lastName, email, birthdate, phone,
    role: SUPER_ADMINS.includes(email) ? 'superadmin' : 'member',
    createdAt: new Date().toISOString()
};

        sendVerificationCode(phone);

        signupScreen.classList.add('hidden');
        verificationScreen.classList.remove('hidden');
        showMessage('קוד נשלח! 📱', 'success');

    } catch (error) {
        console.error('שגיאה:', error);
        showMessage('שגיאה! נסה שוב ❌', 'error');
    }
});

// אימות קוד
verificationForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const enteredCode = document.getElementById('codeInput').value;

    if (enteredCode === currentCode) {
        try {
            // יצירת משתמש ב-Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(
                pendingUser.email,
                'TempPass123!' + pendingUser.phone // סיסמה זמנית
            );

            // שמירת פרטי המשתמש ב-Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                ...pendingUser,
                uid: userCredential.user.uid
            });

            showMessage(`שלום ${pendingUser.firstName}! נרשמת בהצלחה 🎉`, 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('שגיאה:', error);
            showMessage('שגיאה ברישום! נסה שוב ❌', 'error');
        }
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