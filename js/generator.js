/**
 * Generator - המנצח על תהליך יצירת הקבצים והורדתם
 */
const Generator = {
    /**
     * יוצר ומוריד את קובץ המבחן בפורמט HTML עבור התלמיד
     */
    generateAndDownload: function() {
        const name = ExamState.studentName || 'תלמיד';
        const duration = UI.elements.examDurationInput.value || 90;
        const unlockCodePlain = UI.elements.unlockCodeInput.value || '1234';
        const unlockCodeHash = Utils.simpleHash(unlockCodePlain);
        const teacherEmail = UI.elements.teacherEmailInput.value.trim();
        const driveLink = UI.elements.driveFolderInput.value.trim();
        
        // הכנת נתוני הפרויקט להטמעה בתוך הקובץ (מאפשר טעינה חוזרת לעריכה)
        const projectData = {
            state: ExamState,
            meta: {
                duration: UI.elements.examDurationInput.value,
                unlockCode: UI.elements.unlockCodeInput.value,
                teacherEmail: UI.elements.teacherEmailInput.value,
                driveLink: UI.elements.driveFolderInput.value,
                examTitle: UI.elements.examTitleInput.value,
                generalInstructions: UI.elements.examInstructions.value
            },
            timestamp: Date.now()
        };

        // בניית תוכן ה-HTML
        const htmlContent = HTMLBuilder.build(
            name, 
            ExamState.questions, 
            ExamState.instructions, 
            ExamState.examTitle, 
            ExamState.logoData, 
            ExamState.solutionDataUrl, 
            duration, 
            unlockCodeHash, 
            ExamState.parts, 
            teacherEmail, 
            driveLink, 
            projectData
        );

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // הגדרת שם הקובץ על פי כותרת המבחן
        const filename = (ExamState.examTitle || 'מבחן') + ".html";
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        UI.showToast('קובץ המבחן הורד בהצלחה!');
    },

    /**
     * יוצר ומוריד את המבחן כקובץ DOCX (תואם Word) לצרכי הדפסה או פתרון ידני
     */
    generateAndDownloadDocx: function() {
        const content = DocxBuilder.build(
            ExamState.examTitle,
            ExamState.instructions,
            ExamState.parts,
            ExamState.questions,
            ExamState.studentName,
            ExamState.logoData
        );

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // הגדרת שם קובץ ה-Word על פי כותרת המבחן
        link.download = `${ExamState.examTitle || 'מבחן'}.doc`; 
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
