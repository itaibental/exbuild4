const App = {
    init: function() {
        UI.initElements();
        UI.renderPartSelector();
        UI.renderTabs();
        UI.updateStats();
        UI.renderPreview();
        
        const cb = document.getElementById('btnConfirmYes');
        if(cb) cb.onclick = () => { if(UI.confirmCallback) UI.confirmCallback(); UI.closeModal(); };
    },
    setTab: function(id) {
        ExamState.currentTab = id;
        UI.renderTabs(); UI.renderPartSelector(); UI.renderPreview();
    },
    addPart: function() {
        const id = ExamState.getNextPartId();
        ExamState.addPart({ id, name: "חלק " + (ExamState.parts.length+1) });
        this.setTab(id); UI.updateStats();
    },
    updatePartName: function() {
        ExamState.updatePartName(ExamState.currentTab, UI.elements.partNameInput.value);
        UI.renderTabs(); UI.renderPartSelector();
    },
    onPartSelectChange: function() { this.setTab(UI.elements.qPart.value); },
    updateExamTitle: function() {
        ExamState.examTitle = UI.elements.examTitleInput.value;
        UI.elements.previewExamTitle.textContent = ExamState.examTitle || 'מבחן בגרות';
    },
    updateFilenamePreview: function() {
        document.getElementById('filenamePreview').textContent = (ExamState.examTitle || 'מבחן') + ".html";
    },
    addQuestion: function() {
        const text = UI.elements.qText.value.trim();
        if(!text) return UI.showToast("נא להזין תוכן שאלה", "error");
        
        const q = {
            id: Date.now(), part: ExamState.currentTab,
            text, points: parseInt(document.getElementById('qPoints')?.value || 10),
            subQuestions: [...ExamState.tempSubQuestions]
        };
        if(q.subQuestions.length > 0) {
            q.points = q.subQuestions.reduce((a, b) => a + (parseInt(b.points) || 0), 0);
        }
        ExamState.addQuestion(q);
        UI.elements.qText.value = ''; ExamState.tempSubQuestions = [];
        UI.renderSubQuestionInputs(); UI.renderPreview(); UI.updateStats();
        UI.showToast("שאלה נוספה");
    },
    deleteQuestion: function(id) {
        UI.showConfirm("מחיקה", "בטוח?", () => { ExamState.removeQuestion(id); UI.renderPreview(); UI.updateStats(); });
    },
    editQuestion: function(id) {
        const q = ExamState.questions.find(x => x.id === id);
        UI.elements.qText.value = q.text;
        ExamState.tempSubQuestions = [...q.subQuestions];
        ExamState.removeQuestion(id); UI.renderPreview(); UI.updateStats(); UI.renderSubQuestionInputs();
    },
    addSubQuestionField: function() {
        ExamState.tempSubQuestions.push({ id: Date.now()+Math.random(), text: '', points: 5 });
        UI.renderSubQuestionInputs();
    },
    updateSubQuestionData: function(id, f, v) {
        const s = ExamState.tempSubQuestions.find(x => x.id === id);
        if(s) s[f] = v;
    },
    handleProjectLoad: function(e) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (res) => {
            try {
                let data;
                if(file.name.endsWith('.html')) {
                    const doc = new DOMParser().parseFromString(res.target.result, 'text/html');
                    const script = doc.getElementById('exam-engine-data');
                    if(script) data = JSON.parse(script.textContent);
                    else throw new Error();
                } else data = JSON.parse(res.target.result);
                
                Object.assign(ExamState, data.state);
                UI.elements.examTitleInput.value = data.meta.examTitle || '';
                UI.elements.examDurationInput.value = data.meta.duration || 90;
                UI.elements.unlockCodeInput.value = data.meta.unlockCode || '1234';
                UI.elements.driveFolderInput.value = data.meta.driveLink || '';
                this.updateExamTitle(); this.updateFilenamePreview();
                this.setTab(ExamState.parts[0].id); UI.updateStats();
                UI.showToast("מבחן נטען בהצלחה");
            } catch(err) { UI.showToast("שגיאה בטעינת קובץ", "error"); }
        };
        reader.readAsText(file);
    },
    saveProject: function() {
        const data = { state: ExamState, meta: { examTitle: ExamState.examTitle, duration: UI.elements.examDurationInput.value } };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `טיוטה-${ExamState.examTitle || 'מבחן'}.json`; a.click();
    }
};
window.onload = () => App.init();