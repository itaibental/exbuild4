const Generator = {
    generateAndDownload: function() {
        const title = ExamState.examTitle || 'מבחן';
        const pData = {
            state: ExamState,
            meta: {
                examTitle: title,
                duration: document.getElementById('examDurationInput').value,
                unlockCode: document.getElementById('unlockCodeInput').value,
                driveLink: document.getElementById('driveFolderInput').value
            }
        };
        const html = HTMLBuilder.build(
            ExamState.studentName || 'תלמיד',
            ExamState.questions, ExamState.instructions,
            title, null, null,
            pData.meta.duration, Utils.simpleHash(pData.meta.unlockCode),
            ExamState.parts, "", pData.meta.driveLink, pData
        );
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([html], {type:'text/html'}));
        a.download = title + ".html";
        a.click();
    }
};