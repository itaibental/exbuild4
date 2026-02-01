const ExamState = {
    examTitle: "מבחן חדש",
    duration: 90,
    unlockCodeHash: "1234", // שמירת ערך ה-Hash או הסיסמה הגלויה (לפשטות כרגע)
    teacherEmail: "",
    driveLink: "",
    logoData: "",
    design: { fontFamily: "'Rubik', sans-serif", fontSize: "16px" }, // ברירת מחדל לעיצוב
    
    parts: [
        { id: 'part1', name: 'פרק ראשון' }
    ],
    
    questions: [],
    
    instructions: {
        general: '',
        parts: {}
    },

    addPart() {
        const id = 'part' + Date.now();
        this.parts.push({ id: id, name: 'פרק חדש' });
        return id;
    },

    addQuestion(partId) {
        const newQ = {
            id: Date.now(),
            part: partId,
            text: '',
            points: 10,
            subQuestions: [],
            imageUrl: '',
            videoUrl: ''
        };
        this.questions.push(newQ);
        return newQ;
    },

    addSubQuestion(qId) {
        const q = this.questions.find(item => item.id === qId);
        if (q) {
            if(!q.subQuestions) q.subQuestions = [];
            q.subQuestions.push({
                id: Date.now(),
                text: '',
                points: 5,
                modelAnswer: ''
            });
        }
    }
};
