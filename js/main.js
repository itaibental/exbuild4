
const App = {
    init: () => {
        console.log("App Initialized");
    },
    updateExamTitle: () => {
        const val = document.getElementById('examTitleInput').value;
        ExamState.exam.title = val;
        document.getElementById('previewExamTitle').innerText = val || "בחינת בגרות";
    },
    addQuestion: () => {
        const textInput = document.getElementById('qText');
        const pointsInput = document.getElementById('qPoints');
        const text = textInput.value;
        const points = pointsInput.value;

        if(!text) {
            alert('אנא כתוב תוכן לשאלה');
            return;
        }
        
        ExamState.exam.questions.push({ 
            id: Utils.generateId(), 
            text: text, 
            points: points 
        });
        
        UI.renderQuestions();
        
        // Reset inputs
        textInput.value = '';
        pointsInput.value = '10';
    },
    saveProject: () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ExamState.exam));
        const el = document.createElement('a');
        el.setAttribute("href", dataStr);
        el.setAttribute("download", "exam_project.json");
        document.body.appendChild(el);
        el.click();
        el.remove();
    }
};
window.onload = App.init;
