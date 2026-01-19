const UI = {
    elements: {},
    initElements: function() {
        const ids = ['qPart','partNameInput','qText','previewQuestionsContainer','statsContainer','totalPoints','studentNameInput','previewTabs','examTitleInput','previewExamTitle','examDurationInput','unlockCodeInput','teacherEmailInput','driveFolderInput','subQuestionsList','toastContainer','confirmModal'];
        ids.forEach(id => this.elements[id] = document.getElementById(id));
    },
    showToast: function(msg, type='success') {
        const t = document.createElement('div');
        t.className = 'toast'; t.textContent = msg;
        this.elements.toastContainer.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },
    renderPartSelector: function() {
        this.elements.qPart.innerHTML = ExamState.parts.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        this.elements.qPart.value = ExamState.currentTab;
    },
    renderTabs: function() {
        this.elements.previewTabs.innerHTML = ExamState.parts.map(p => `<div class="tab ${p.id === ExamState.currentTab ? 'active' : ''}" onclick="App.setTab('${p.id}')">${p.name}</div>`).join('');
    },
    updateStats: function() {
        let total = 0;
        this.elements.statsContainer.innerHTML = ExamState.parts.map(p => {
            const qs = ExamState.questions.filter(q => q.part === p.id);
            const sum = qs.reduce((a,b) => a + (parseInt(b.points)||0), 0);
            total += sum;
            return `<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>${p.name}:</span> <span>${sum} נק'</span></div>`;
        }).join('');
        this.elements.totalPoints.textContent = total;
    },
    renderPreview: function() {
        const container = this.elements.previewQuestionsContainer;
        const filtered = ExamState.questions.filter(q => q.part === ExamState.currentTab);
        container.innerHTML = filtered.map((q, i) => `
            <div class="preview-q-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>שאלה ${i+1} (${q.points} נק')</strong>
                    <div>
                        <button onclick="App.editQuestion(${q.id})" style="background:none; border:none; cursor:pointer;">✏️</button>
                        <button onclick="App.deleteQuestion(${q.id})" style="background:none; border:none; cursor:pointer;">🗑️</button>
                    </div>
                </div>
                <p style="margin:10px 0; font-size:0.9rem; color:#444;">${q.text}</p>
            </div>
        `).join('') || '<p style="text-align:center; color:#ccc;">אין שאלות בחלק זה</p>';
    },
    renderSubQuestionInputs: function() {
        this.elements.subQuestionsList.innerHTML = ExamState.tempSubQuestions.map((sq, i) => `
            <div style="display:flex; gap:5px; margin-top:5px; align-items:center;">
                <span style="font-weight:bold;">${ExamState.subLabels[i]}.</span>
                <input type="text" placeholder="תוכן סעיף" oninput="App.updateSubQuestionData('${sq.id}', 'text', this.value)" value="${sq.text}">
                <input type="number" style="width:60px;" oninput="App.updateSubQuestionData('${sq.id}', 'points', this.value)" value="${sq.points}">
            </div>
        `).join('');
    },
    showConfirm: function(t, txt, cb) { this.confirmCallback = cb; this.elements.confirmModal.style.display='flex'; },
    closeModal: function() { this.elements.confirmModal.style.display='none'; }
};