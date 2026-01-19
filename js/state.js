const ExamState = {
    questions: [],
    parts: [{ id: 'A', name: 'חלק ראשון' }],
    currentTab: 'A',
    studentName: '',
    examTitle: 'מבחן בגרות', 
    instructions: { general: '', parts: {} },
    subLabels: ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"],
    tempSubQuestions: [],
    addQuestion: function(q) { this.questions.push(q); },
    removeQuestion: function(id) { this.questions = this.questions.filter(q => q.id !== id); },
    addPart: function(part) { this.parts.push(part); },
    removePart: function(id) {
        this.questions = this.questions.filter(q => q.part !== id);
        this.parts = this.parts.filter(p => p.id !== id);
    },
    updatePartName: function(id, name) {
        const p = this.parts.find(p => p.id === id);
        if (p) p.name = name;
    },
    getNextPartId: function() { return 'P' + Date.now(); }
};