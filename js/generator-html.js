const HTMLBuilder = {
    build: function(name, questions, instructions, title, logo, solution, duration, codeHash, parts, email, drive, project) {
        const sections = parts.map(p => {
            const qs = questions.filter(q => q.part === p.id);
            const qHtml = qs.map((q, i) => `
                <div class="q-block">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <strong>שאלה ${i+1} (${q.points} נק'):</strong>
                    </div>
                    <div class="q-content">${q.text}</div>
                    ${q.subQuestions.map((s, si) => `
                        <div class="sub-q" style="margin-top:10px; border-right:3px solid #eee; padding-right:10px;">
                            <strong>סעיף ${ExamState.subLabels[si]}. (${s.points} נק')</strong>
                            <div>${s.text}</div>
                            <textarea class="student-ans" placeholder="תשובה לסעיף ${ExamState.subLabels[si]}..."></textarea>
                            <div class="grading-area" style="display:none; background:#f9f9f9; padding:10px; margin-top:10px; border-radius:5px;">
                                ניקוד: <input type="number" class="grade-input" max="${s.points}" oninput="calcTotal()"> מתוך ${s.points}
                                <input type="text" class="teacher-comment" placeholder="הערה...">
                            </div>
                        </div>
                    `).join('') || `<textarea class="student-ans" placeholder="כתוב את תשובתך כאן..."></textarea>
                    <div class="grading-area" style="display:none; background:#f9f9f9; padding:10px; margin-top:10px; border-radius:5px;">
                        ניקוד: <input type="number" class="grade-input" max="${q.points}" oninput="calcTotal()"> מתוך ${q.points}
                        <input type="text" class="teacher-comment" placeholder="הערה...">
                    </div>`}
                </div>
            `).join('');
            return `<div id="part-${p.id}" class="exam-section">${qHtml}</div>`;
        }).join('');

        return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>${title}</title>
        <style>
            :root { --primary: #2c3e50; --accent: #3498db; }
            body{font-family:sans-serif; padding:40px; background:#f0f2f5; margin:0;}
            .container{max-width:850px; margin:auto; background:white; padding:40px; border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.05);}
            .q-block{margin-bottom:40px; border-bottom:1px solid #eee; padding-bottom:20px;}
            textarea{width:100%; height:120px; margin-top:10px; border-radius:8px; border:1px solid #ccc; padding:15px; font-family:inherit; box-sizing:border-box;}
            .highlighter{position:fixed; top:20px; right:20px; background:white; padding:15px; border-radius:35px; box-shadow:0 5px 20px rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:12px; z-index:1000;}
            .color-dot{width:32px; height:32px; border-radius:50%; cursor:pointer; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.1);}
            #timerBadge{position:fixed; top:20px; left:20px; background:white; padding:10px 20px; border-radius:20px; font-weight:bold; box-shadow:0 5px 20px rgba(0,0,0,0.1);}
            .teacher-header{display:none; background:#fff3cd; padding:25px; border-radius:12px; margin-bottom:30px; border:2px solid #ffeeba;}
        </style></head>
        <body>
            <script type="application/json" id="exam-engine-data">${JSON.stringify(project)}</script>
            <div id="timerBadge">⏳ זמן נותר: <span id="timeText">--:--</span></div>
            <div class="highlighter">
                <div class="color-dot" style="background:#ffeb3b" onclick="setMarker('#ffeb3b')"></div>
                <div class="color-dot" style="background:#a6ff00" onclick="setMarker('#a6ff00')"></div>
                <div class="color-dot" style="background:#ff4081" onclick="setMarker('#ff4081')"></div>
                <div class="color-dot" style="background:#eee; display:flex; align-items:center; justify-content:center; font-size:14px;" onclick="setMarker('eraser')">🧽</div>
                <div class="color-dot" style="background:#fff; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-size:14px;" onclick="setMarker(null)">❌</div>
            </div>
            <div class="container">
                <div class="teacher-header" id="tHeader">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="margin:0;">👨‍🏫 מצב בדיקה - ציון סופי: <span id="finalScoreBadge" style="color:#27ae60;">0</span></h2>
                        </div>
                        <button onclick="saveGraded()" style="background:#27ae60; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;">💾 שמור בדיקה</button>
                    </div>
                </div>
                <h1 style="text-align:center; color:var(--primary);">${title}</h1>
                <div style="margin-bottom:30px; padding:15px; background:#f8f9fa; border-radius:8px;"><strong>תלמיד:</strong> ${name}</div>
                <form id="examForm">${sections}</form>
                <div style="text-align:center; margin-top:60px;">
                    <button onclick="submitExam()" style="background:#27ae60; color:white; padding:18px 50px; border:none; border-radius:50px; cursor:pointer; font-size:1.3rem; font-weight:bold; box-shadow:0 10px 20px rgba(39, 174, 96, 0.2);">הגש מבחן סופי 📤</button>
                </div>
            </div>
            <script>
                let marker=null;
                function setMarker(c){ 
                    marker=c; 
                    document.body.style.cursor=c?'crosshair':'default'; 
                    const container = document.querySelector('.container');
                    if(c) container.contentEditable='true'; else container.contentEditable='false'; 
                }
                document.onmouseup=()=>{
                    if(!marker) return;
                    const sel=window.getSelection();
                    if(!sel.isCollapsed){
                        document.execCommand('styleWithCSS', false, true);
                        document.execCommand('hiliteColor', false, marker==='eraser'?'transparent':marker);
                        sel.removeAllRanges();
                    }
                };
                function calcTotal(){
                    let s=0; document.querySelectorAll('.grade-input').forEach(i=>s+=parseFloat(i.value)||0);
                    document.getElementById('finalScoreBadge').innerText=s;
                }
                function submitExam(){
                    document.querySelectorAll('input,textarea').forEach(i=>{
                        i.setAttribute('value',i.value);
                        if(i.tagName==='TEXTAREA') i.innerHTML = i.value;
                    });
                    const blob=new Blob(["<!DOCTYPE html>"+document.documentElement.outerHTML],{type:'text/html'});
                    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); 
                    a.download="${title} - פתור - " + "${name}" + ".html"; a.click();
                    if("${drive}") window.open("${drive}", "_blank");
                    alert("המבחן נשמר בהצלחה!");
                }
                function saveGraded(){
                    document.querySelectorAll('input,textarea').forEach(i=>{
                        i.setAttribute('value',i.value);
                        if(i.tagName==='TEXTAREA') i.innerHTML = i.value;
                    });
                    const blob=new Blob(["<!DOCTYPE html>"+document.documentElement.outerHTML],{type:'text/html'});
                    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); 
                    a.download="${title} - בדוק - " + "${name}" + ".html"; a.click();
                }
            </script>
        </body></html>`;
    }
};