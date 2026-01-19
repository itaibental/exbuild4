
const UI = {
    renderQuestions: () => {
        const container = document.getElementById('previewQuestionsContainer');
        container.innerHTML = ExamState.exam.questions.map((q, i) => `
            <div class="question-card">
                <div style="font-weight:bold; color:var(--accent); margin-bottom:0.5rem;">שאלה ${i+1} (${q.points} נק')</div>
                <div>${Utils.sanitize(q.text)}</div>
            </div>
        `).join('');
        
        const total = ExamState.exam.questions.reduce((sum, q) => sum + parseInt(q.points||0), 0);
        document.getElementById('totalPoints').innerText = total;
    }
};
