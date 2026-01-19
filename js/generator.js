
const Generator = {
    generateAndDownload: () => {
        const title = ExamState.exam.title || "מבחן";
        let htmlContent = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body{font-family:'Arial',sans-serif;background:#f9f9f9;padding:20px;}
        .container{max-width:800px;margin:0 auto;background:white;padding:40px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}
        h1{text-align:center;color:#2c3e50;}
        .question{margin-bottom:20px;padding:15px;border-bottom:1px solid #eee;}
        .q-header{font-weight:bold;margin-bottom:10px;color:#3498db;}
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <div style="text-align:center;margin-bottom:30px;">
            <input type="text" placeholder="שם תלמיד מלא" style="padding:10px;width:50%;text-align:center;">
        </div>
`;
        
        ExamState.exam.questions.forEach((q, i) => {
            htmlContent += `
        <div class="question">
            <div class="q-header">שאלה ${i+1} (${q.points} נק')</div>
            <div>${q.text}</div>
            <textarea style="width:100%;margin-top:10px;padding:10px;height:100px;border:1px solid #ccc;" placeholder="כתוב את תשובתך כאן..."></textarea>
        </div>`;
        });

        htmlContent += `
        <div style="text-align:center;margin-top:30px;">
            <button onclick="alert('המבחן הוגש בהצלחה!')" style="background:#10b981;color:white;padding:15px 30px;border:none;font-size:1.2rem;cursor:pointer;border-radius:5px;">הגש מבחן</button>
        </div>
    </div>
</body></html>`;

        const blob = new Blob([htmlContent], {type: 'text/html'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "exam_student.html";
        a.click();
    }
};
