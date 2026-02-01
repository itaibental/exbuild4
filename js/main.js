const App = {
    init: function() {
        UI.initElements();
        
        // Initial setup
        if(ExamState.parts.length === 0) {
            this.addPart(); // Ensure at least one part exists
        }
        
        UI.renderTabs();
        this.setTab(ExamState.parts[0].id);
        
        // Load initial values to global inputs
        if(UI.elements.examTitleInput) UI.elements.examTitleInput.value = ExamState.examTitle;
        if(UI.elements.previewExamTitle) UI.elements.previewExamTitle.textContent = ExamState.examTitle;
        if(UI.elements.examInstructions) UI.elements.examInstructions.value = ExamState.instructions.general;
        if(UI.elements.examDurationInput) UI.elements.examDurationInput.value = 90;

        Utils.setupResizers();
    },

    // --- NEW INLINE EDITING LOGIC ---

    addNewQuestionToCurrentPart: function() {
        const question = {
            id: Date.now(),
            part: ExamState.currentTab,
            points: 10,
            text: '',
            modelAnswer: '',
            videoUrl: '',
            imageUrl: '',
            videoOptions: { showControls: true, modestBranding: true, showRelated: false },
            subQuestions: []
        };
        ExamState.addQuestion(question);
        UI.updateStats();
        UI.renderPreview();
        // Scroll to bottom
        setTimeout(() => {
            const container = document.getElementById('previewQuestionsContainer');
            container.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    },

    updateQuestionField: function(id, field, value) {
        const q = ExamState.questions.find(q => q.id === id);
        if(q) {
            q[field] = value;
            if(field === 'points') UI.updateStats();
        }
    },

    deleteQuestion: function(id) {
        UI.showConfirm('מחיקת שאלה', 'האם למחוק את השאלה לצמיתות?', () => {
            ExamState.removeQuestion(id);
            UI.updateStats();
            UI.renderPreview();
            UI.showToast('השאלה נמחקה');
        });
    },

    duplicateQuestion: function(id) {
        const original = ExamState.questions.find(q => q.id === id);
        if(!original) return;
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = Date.now();
        // Insert after original
        const index = ExamState.questions.findIndex(q => q.id === id);
        ExamState.questions.splice(index + 1, 0, copy);
        UI.updateStats();
        UI.renderPreview();
    },

    // Sub Questions Logic
    addSubQuestion: function(qId) {
        const q = ExamState.questions.find(q => q.id === qId);
        if(!q) return;
        if(!q.subQuestions) q.subQuestions = [];
        q.subQuestions.push({
            id: Date.now(),
            text: '',
            points: 5,
            modelAnswer: '',
            imageUrl: '',
            videoUrl: ''
        });
        UI.renderPreview(); 
    },

    deleteSubQuestion: function(qId, subId) {
        const q = ExamState.questions.find(q => q.id === qId);
        if(q && q.subQuestions) {
            q.subQuestions = q.subQuestions.filter(sq => sq.id !== subId);
            UI.renderPreview();
        }
    },

    updateSubQuestionField: function(qId, subId, field, value) {
        const q = ExamState.questions.find(q => q.id === qId);
        const sq = q?.subQuestions?.find(s => s.id === subId);
        if(sq) {
            if (field === 'points') {
                sq.points = parseInt(value) || 0;
            } else {
                sq[field] = value;
            }
        }
    },

    // Parts Logic
    addPart: function() {
        const nextIdx = ExamState.parts.length;
        let suffix = "";
        if (nextIdx < ExamState.partNamesList.length) suffix = ExamState.partNamesList[nextIdx];
        else suffix = (nextIdx + 1).toString();
        const newId = ExamState.getNextPartId();
        const newName = "פרק " + suffix;
        ExamState.addPart({ id: newId, name: newName });
        UI.renderTabs();
        this.setTab(newId);
        UI.showToast(`פרק חדש נוסף: ${newName}`);
    },

    setTab: function(partId) {
        ExamState.currentTab = partId;
        UI.renderTabs();
        UI.renderPreview();
    },

    updatePartNameInternal: function(value) {
        ExamState.updatePartName(ExamState.currentTab, value);
        UI.renderTabs(); 
    },

    removePart: function() {
        if (ExamState.parts.length <= 1) {
            UI.showToast('חייב להישאר לפחות פרק אחד.', 'error');
            return;
        }
        UI.showConfirm('מחיקת פרק', 'האם למחוק את הפרק הנוכחי? כל השאלות בפרק יימחקו.', () => {
            ExamState.removePart(ExamState.currentTab);
            if (ExamState.parts.length > 0) this.setTab(ExamState.parts[0].id);
            else this.addPart();
            UI.updateStats();
        });
    },

    updatePartInstructionsFromPreview: function(value) {
        ExamState.instructions.parts[ExamState.currentTab] = value;
    },

    // Global Fields
    updateExamTitle: function() {
        const val = UI.elements.examTitleInput.value;
        ExamState.examTitle = val || 'מבחן בגרות';
        if(UI.elements.previewExamTitle) UI.elements.previewExamTitle.textContent = ExamState.examTitle;
    },

    updateGeneralInstructions: function(val) {
        ExamState.instructions.general = val;
    },

    // --- File Handling (Save/Load) ---
    saveProject: function() {
        try {
            const projectData = {
                state: ExamState,
                meta: {
                    duration: UI.elements.examDurationInput?.value || 90,
                    unlockCode: UI.elements.unlockCodeInput?.value || '',
                    teacherEmail: UI.elements.teacherEmailInput?.value || '',
                    driveLink: UI.elements.driveFolderInput?.value || '',
                    examTitle: ExamState.examTitle,
                    generalInstructions: ExamState.instructions.general
                },
                timestamp: Date.now()
            };
            const dataStr = JSON.stringify(projectData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exam-draft-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            UI.showToast('טיוטת המבחן נשמרה בהצלחה!');
        } catch (e) {
            console.error("Save Error:", e);
            UI.showToast('שגיאה בשמירת הטיוטה: ' + e.message, 'error');
        }
    },

    handleProjectLoad: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                let loaded;
                if (file.name.endsWith('.html')) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(e.target.result, 'text/html');
                    const scriptTag = doc.getElementById('exam-engine-data');
                    if (scriptTag && scriptTag.textContent) {
                        loaded = JSON.parse(scriptTag.textContent);
                    } else {
                        throw new Error("לא נמצא מידע פרויקט בקובץ ה-HTML זה.");
                    }
                } else {
                    loaded = JSON.parse(e.target.result);
                }
                
                // Restore State
                ExamState.questions = loaded.state.questions || [];
                ExamState.parts = loaded.state.parts || [];
                ExamState.currentTab = loaded.state.parts[0]?.id || 'A';
                ExamState.examTitle = loaded.state.examTitle || 'מבחן בגרות';
                ExamState.logoData = loaded.state.logoData;
                ExamState.instructions = loaded.state.instructions || { general: '', parts: {} };

                // Restore Meta
                if (loaded.meta) {
                    if (UI.elements.examDurationInput) UI.elements.examDurationInput.value = loaded.meta.duration || 90;
                    if (UI.elements.unlockCodeInput) UI.elements.unlockCodeInput.value = loaded.meta.unlockCode || '';
                    if (UI.elements.teacherEmailInput) UI.elements.teacherEmailInput.value = loaded.meta.teacherEmail || '';
                    if (UI.elements.driveFolderInput) UI.elements.driveFolderInput.value = loaded.meta.driveLink || '';
                    if (UI.elements.examTitleInput) UI.elements.examTitleInput.value = loaded.meta.examTitle || ExamState.examTitle;
                }

                // Restore UI
                if (ExamState.logoData && UI.elements.previewLogo) {
                    UI.elements.previewLogo.src = ExamState.logoData;
                    UI.elements.previewLogo.style.display = 'block';
                    if(document.getElementById('logoStatus')) document.getElementById('logoStatus').textContent = 'לוגו נטען';
                }
                if (UI.elements.previewExamTitle) UI.elements.previewExamTitle.textContent = ExamState.examTitle;
                if (UI.elements.examInstructions) UI.elements.examInstructions.value = ExamState.instructions.general;

                UI.renderTabs();
                App.setTab(ExamState.currentTab);
                UI.updateStats();
                UI.showToast('המבחן נטען בהצלחה!');
            } catch (err) {
                console.error(err);
                UI.showToast('שגיאה בטעינת הקובץ: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; 
    },

    handleLogoUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                ExamState.logoData = e.target.result;
                UI.elements.previewLogo.src = ExamState.logoData;
                UI.elements.previewLogo.style.display = 'block';
                if(document.getElementById('logoStatus')) document.getElementById('logoStatus').textContent = 'לוגו נטען';
            };
            reader.readAsDataURL(file);
        }
    },
    
    // Simplified formatting using active element
    applyFormat: function(tag) {
        const activeEl = document.activeElement;
        
        // Ensure we only format text inputs or textareas
        if (!activeEl || (activeEl.tagName !== 'TEXTAREA' && (activeEl.tagName !== 'INPUT' || activeEl.type !== 'text'))) {
            UI.showToast('אנא סמן טקסט בתוך תיבה', 'error');
            return;
        }

        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        const text = activeEl.value;
        const selectedText = text.substring(start, end);
        
        if (!selectedText) {
            // Optional: Insert empty tags or show message
            // For now, let's assume we want to wrap selection
            return;
        }
        
        const newText = text.substring(0, start) + `<${tag}>${selectedText}</${tag}>` + text.substring(end);
        activeEl.value = newText;
        
        // Trigger input event to update state immediately
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Restore focus and selection
        activeEl.focus();
        activeEl.setSelectionRange(start, end + tag.length * 2 + 3 + 2); // approximate cursor placement
    }
};

window.onload = function() {
    App.init();
};