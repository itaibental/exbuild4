const UI = {
    currentMediaQId: null, // שומר על איזו שאלה אנחנו מוסיפים מדיה

    init() {
        this.renderEditor();
        this.populateSettings();
    },

    // מילוי השדות בסרגל הצד לפי הנתונים הקיימים
    populateSettings() {
        document.getElementById('examTitle').value = ExamState.examTitle || '';
        document.getElementById('generalInstructions').value = ExamState.instructions.general || '';
        document.getElementById('examDuration').value = ExamState.duration || 90;
        document.getElementById('driveLink').value = ExamState.driveLink || '';
        document.getElementById('teacherEmail').value = ExamState.teacherEmail || '';
    },

    // הפונקציה הראשית שמרנדרת את כל העורך
    renderEditor() {
        const container = document.getElementById('editor-container');
        container.innerHTML = '';

        ExamState.parts.forEach((part, pIdx) => {
            const partDiv = document.createElement('div');
            partDiv.className = 'part-container';
            partDiv.innerHTML = `
                <div class="part-header">
                    <input type="text" value="${part.name}" onchange="UI.updatePartName('${part.id}', this.value)" placeholder="שם הפרק...">
                    <button class="btn-icon delete" onclick="UI.deletePart('${part.id}')" title="מחק פרק"><i class="fas fa-trash"></i></button>
                </div>
                <div class="questions-list" id="questions-part-${part.id}"></div>
                <button onclick="UI.addQuestion('${part.id}')" style="margin-top:10px; background:none; border:1px dashed #bbb; width:100%; padding:10px; cursor:pointer; color:#555;">+ הוסף שאלה לפרק זה</button>
            `;
            container.appendChild(partDiv);

            const qList = partDiv.querySelector(`#questions-part-${part.id}`);
            const partQuestions = ExamState.questions.filter(q => q.part === part.id);

            partQuestions.forEach((q, qIdx) => {
                qList.appendChild(this.createQuestionCard(q, qIdx + 1));
            });
        });
    },

    // יצירת כרטיס שאלה בודד
    createQuestionCard(q, index) {
        const card = document.createElement('div');
        card.className = 'question-card';
        
        let mediaBadge = '';
        if(q.imageUrl) mediaBadge = `<span style="color:#27ae60; font-size:0.8em;"><i class="fas fa-image"></i> יש תמונה</span>`;
        if(q.videoUrl) mediaBadge = `<span style="color:#e74c3c; font-size:0.8em;"><i class="fas fa-video"></i> יש וידאו</span>`;

        card.innerHTML = `
            <div class="q-toolbar">
                <strong>שאלה ${index}</strong>
                <div style="display:flex; gap:10px; align-items:center;">
                    ${mediaBadge}
                    <button class="btn-icon" onclick="UI.openMediaModal(${q.id})" title="הוסף מדיה"><i class="fas fa-photo-video"></i></button>
                    <input type="number" class="points-input" value="${q.points}" onchange="UI.updateQPoints(${q.id}, this.value)" title="ניקוד כולל לשאלה">
                    <button class="btn-icon delete" onclick="UI.deleteQuestion(${q.id})" title="מחק שאלה"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="q-body">
                <textarea placeholder="תוכן השאלה..." onchange="UI.updateQText(${q.id}, this.value)">${q.text}</textarea>
            </div>
            <div class="sub-questions-list" id="sub-q-list-${q.id}">
                </div>
            <button onclick="UI.addSubQuestion(${q.id})" style="font-size:0.9em; background:none; border:none; color:var(--accent); cursor:pointer;">+ הוסף סעיף</button>
        `;

        // רינדור הסעיפים
        const subList = card.querySelector(`#sub-q-list-${q.id}`);
        if (q.subQuestions && q.subQuestions.length > 0) {
            q.subQuestions.forEach((sq, sIdx) => {
                subList.innerHTML += `
                    <div class="sub-q-item">
                        <span style="font-weight:bold; padding-top:10px;">${sIdx+1}.</span>
                        <div style="flex:1;">
                            <textarea style="width:100%; height:40px; margin-bottom:0;" placeholder="תוכן הסעיף..." onchange="UI.updateSubQText(${q.id}, ${sq.id}, this.value)">${sq.text}</textarea>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:5px;">
                             <input type="number" class="points-input" style="width:50px; font-size:0.8em;" value="${sq.points}" onchange="UI.updateSubQPoints(${q.id}, ${sq.id}, this.value)" placeholder="נק'">
                             <button class="btn-icon delete" onclick="UI.deleteSubQuestion(${q.id}, ${sq.id})"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                `;
            });
        }
        return card;
    },

    // --- עדכונים ל-State ---

    addPart() { ExamState.addPart(); this.renderEditor(); },
    deletePart(id) { if(confirm('למחוק את הפרק?')) { ExamState.parts = ExamState.parts.filter(p => p.id !== id); this.renderEditor(); } },
    updatePartName(id, val) { const p = ExamState.parts.find(x => x.id === id); if(p) p.name = val; },

    addQuestion(partId) { ExamState.addQuestion(partId); this.renderEditor(); },
    deleteQuestion(id) { 
        if(confirm('למחוק את השאלה?')) { 
            ExamState.questions = ExamState.questions.filter(q => q.id !== id); 
            this.renderEditor(); 
        } 
    },
    updateQText(id, val) { const q = ExamState.questions.find(x => x.id === id); if(q) q.text = val; },
    updateQPoints(id, val) { const q = ExamState.questions.find(x => x.id === id); if(q) q.points = parseInt(val); },

    addSubQuestion(qId) { ExamState.addSubQuestion(qId); this.renderEditor(); },
    updateSubQText(qId, sqId, val) { 
        const q = ExamState.questions.find(x => x.id === qId);
        const sq = q.subQuestions.find(x => x.id === sqId);
        if(sq) sq.text = val;
    },
    updateSubQPoints(qId, sqId, val) {
        const q = ExamState.questions.find(x => x.id === qId);
        const sq = q.subQuestions.find(x => x.id === sqId);
        if(sq) sq.points = parseInt(val);
    },
    deleteSubQuestion(qId, sqId) {
        const q = ExamState.questions.find(x => x.id === qId);
        if(q) {
            q.subQuestions = q.subQuestions.filter(x => x.id !== sqId);
            this.renderEditor();
        }
    },

    // --- טיפול במדיה ומודאל ---
    openMediaModal(qId) {
        this.currentMediaQId = qId;
        const q = ExamState.questions.find(x => x.id === qId);
        document.getElementById('mediaUrl').value = q.imageUrl || q.videoUrl || '';
        document.getElementById('mediaType').value = q.videoUrl ? 'video' : 'image';
        document.getElementById('mediaModal').style.display = 'flex';
    },
    closeModal() { document.getElementById('mediaModal').style.display = 'none'; },
    saveMedia() {
        const qId = this.currentMediaQId;
        const type = document.getElementById('mediaType').value;
        const url = document.getElementById('mediaUrl').value;
        const q = ExamState.questions.find(x => x.id === qId);
        
        if(type === 'image') { q.imageUrl = url; q.videoUrl = ''; }
        else { q.videoUrl = url; q.imageUrl = ''; }
        
        this.closeModal();
        this.renderEditor();
    },

    // --- עיצוב (פונטים) ---
    updateDesign() {
        const font = document.getElementById('fontFamilySelector').value;
        const size = document.getElementById('fontSizeSelector').value;
        document.getElementById('editor-container').style.fontFamily = font;
        
        // שמירת ההגדרה ב-CSS שיוזרק למבחן הסופי (דרך Generator)
        ExamState.design = { fontFamily: font, fontSize: size };
    }
};
