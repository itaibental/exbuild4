/**
 * ניהול ארכיון המבחנים
 */

// משתנה גלובלי לאחסון המבחנים
// אנו מנסים לקחת מ-examsDB (אם נטען מקובץ חיצוני) או מ-localStorage (לצורך עריכה מקומית)
let archiveList = [];

function initArchive() {
    // 1. נסה לטעון מ-LocalStorage (עדיפות למורה שעורך כרגע)
    const localData = localStorage.getItem('examArchive_v1');
    
    if (localData) {
        archiveList = JSON.parse(localData);
    } else if (typeof examsDB !== 'undefined' && examsDB.length > 0) {
        // 2. אם אין מקומי, טען מהקובץ החיצוני (exams_data.js)
        archiveList = [...examsDB];
        // שמור ללוקאלי כדי שיהיה ניתן לעריכה
        localStorage.setItem('examArchive_v1', JSON.stringify(archiveList));
    }

    renderArchive();
}

function renderArchive() {
    const grid = document.getElementById('examGrid');
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    
    grid.innerHTML = '';

    const filtered = archiveList.filter(exam => 
        exam.name.toLowerCase().includes(searchTerm) || 
        exam.year.toString().includes(searchTerm)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:#7f8c8d; margin-top:30px;">
            <h3>לא נמצאו מבחנים בארכיון</h3>
            <p>מורה? הכנס למצב ניהול כדי להוסיף מבחנים.</p>
        </div>`;
        return;
    }

    // מיון לפי שנה יורדת (הכי חדש למעלה)
    filtered.sort((a, b) => b.year - a.year);

    filtered.forEach(exam => {
        const card = document.createElement('div');
        card.className = 'exam-card';
        card.innerHTML = `
            <div class="exam-year">${exam.year}</div>
            <div class="exam-icon">📄</div>
            <div class="exam-name">${exam.name}</div>
            <div class="exam-date">עודכן: ${new Date(exam.dateAdded).toLocaleDateString()}</div>
        `;
        
        // בעת לחיצה - פתיחת המבחן
        card.onclick = () => {
            // אם זה קובץ שהועלה כ-Base64 (פחות מומלץ למבחנים כבדים אבל עובד לוקאלית)
            if (exam.fileData && exam.fileData.startsWith('data:')) {
                const win = window.open();
                win.document.write(atob(exam.fileData.split(',')[1])); // Decode Base64
                win.document.close();
            } else {
                // אם זה נתיב לקובץ (הדרך המומלצת בשרת)
                window.open(exam.filePath || exam.fileName, '_blank');
            }
        };

        // כפתור מחיקה (רק במצב ניהול שמוצג)
        if (document.getElementById('adminPanel').style.display !== 'none') {
            const delBtn = document.createElement('button');
            delBtn.innerText = '❌';
            delBtn.style.cssText = 'position:absolute; top:10px; left:10px; background:red; border:none; border-radius:50%; width:30px; height:30px; color:white; cursor:pointer; font-size:12px; padding:0;';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteExam(exam.id);
            };
            card.appendChild(delBtn);
        }

        grid.appendChild(card);
    });
}

// --- פונקציות ניהול (מורה) ---

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const isHidden = panel.style.display === 'none';
    
    if (isHidden) {
        const pass = prompt('הכנס סיסמת ניהול:');
        if (pass === '1234') { // סיסמה פשוטה להדגמה
            panel.style.display = 'block';
            renderArchive(); // לרענן כדי להציג כפתורי מחיקה
        } else {
            alert('סיסמה שגויה');
        }
    } else {
        panel.style.display = 'none';
        renderArchive(); // לרענן כדי להסתיר כפתורי מחיקה
    }
}

function addExamToArchive() {
    const nameInput = document.getElementById('newExamName');
    const yearInput = document.getElementById('newExamYear');
    const fileInput = document.getElementById('newExamFile');

    if (!nameInput.value || !yearInput.value || !fileInput.files[0]) {
        alert('נא למלא את כל השדות ולבחור קובץ');
        return;
    }

    const file = fileInput.files[0];
    
    // קריאת הקובץ (לצורך שמירה ב-exams_data.js)
    // הערה: בגלל שאנחנו לא יכולים להעלות פיזית לשרת, אנחנו שומרים את שם הקובץ
    // והמורה יצטרך ידנית לשים את קובץ ה-HTML באותה תיקייה.
    
    const newExam = {
        id: Date.now(),
        name: nameInput.value,
        year: parseInt(yearInput.value),
        fileName: file.name,     // שם הקובץ לקישור
        filePath: file.name,     // נניח שהקובץ נמצא באותה תיקייה
        dateAdded: Date.now()
    };

    archiveList.push(newExam);
    saveToLocal();
    
    nameInput.value = '';
    yearInput.value = '';
    fileInput.value = '';
    
    renderArchive();
    alert(`המבחן נוסף לרשימה!\n\nחשוב: כדי שהתלמידים יוכלו לפתוח את המבחן, עליך להעתיק את הקובץ "${file.name}" לתיקייה שבה נמצא האתר.`);
}

function deleteExam(id) {
    if(confirm('האם למחוק מבחן זה מהרשימה?')) {
        archiveList = archiveList.filter(e => e.id !== id);
        saveToLocal();
        renderArchive();
    }
}

function clearArchive() {
    if(confirm('פעולה זו תמחק את כל הרשימה. האם להמשיך?')) {
        archiveList = [];
        saveToLocal();
        renderArchive();
    }
}

function saveToLocal() {
    localStorage.setItem('examArchive_v1', JSON.stringify(archiveList));
}

function downloadDataFile() {
    // יצירת תוכן קובץ ה-JS
    const content = `// קובץ נתונים - ארכיון מבחנים\n// עדכון אחרון: ${new Date().toLocaleString()}\n\nconst examsDB = ${JSON.stringify(archiveList, null, 4)};`;
    
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exams_data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert('הקובץ exams_data.js ירד למחשבך.\n\nכדי לעדכן את האתר לכולם:\n1. העלה את הקובץ הזה לתיקיית האתר (דרוס את הקובץ הישן).\n2. וודא שקבצי ה-HTML של המבחנים שהוספת נמצאים גם הם באותה תיקייה.');
}

// הפעלה ראשונית
window.onload = initArchive;
