/**
 * HTMLBuilder
 */
const HTMLBuilder = {
    build: function(studentName, questions, instructions, examTitle, logoData, solutionDataUrl, duration, unlockCodeHash, parts, teacherEmail, driveLink, projectData) {
        
        const tabsHTML = parts.map((p, idx) => `<button class="tab-btn ${idx===0?'active':''}" onclick="showPart('${p.id}')">${p.name}</button>`).join('');

        const sectionsHTML = parts.map((p, idx) => {
            const partQuestions = questions.filter(q => q.part === p.id);
            const partInstrHtml = instructions.parts[p.id] ? `<div class="part-instructions">${instructions.parts[p.id].replace(/\n/g, '<br>')}</div>` : '';
            
            let qHtml = '';
            if(partQuestions.length === 0) {
                qHtml = '<p style="text-align:center; color:#95a5a6; padding:20px;">אין שאלות בחלק זה</p>';
            } else {
                qHtml = partQuestions.map((q, qIdx) => {
                    const embedSrc = Utils.getVideoEmbedUrl(q.videoUrl, q.videoOptions);
                    let vid = embedSrc ? `<div class="video-wrapper"><div class="video-shield"></div><iframe sandbox="allow-scripts allow-same-origin allow-presentation" src="${embedSrc}" frameborder="0"></iframe></div>` : '';
                    const imgSrc = Utils.getImageSrc(q.imageUrl);
                    let img = imgSrc ? `<div class="image-wrapper"><img src="${imgSrc}" alt="Question Image"></div>` : '';

                    let interactionHTML = '';
                    let gradingHTML = '';
                    let modelAnsHtml = '';

                    if (q.subQuestions && q.subQuestions.length > 0) {
                        interactionHTML = q.subQuestions.map((sq, si) => {
                            const label = ExamState.subLabels[si] || (si + 1);
                            const sqModelAns = sq.modelAnswer ? `<div class="model-answer-secret" style="display:none; margin-top:5px; background:#fff3cd; color:#856404; padding:5px; border-radius:4px; font-size:0.9em; border:1px solid #ffeeba;"><strong>מחוון (${label}'):</strong> <span class="model-ans-text-content">${sq.modelAnswer}</span></div>` : '';
                            return `
                            <div class="sub-question-block" data-points="${sq.points}" style="margin-top:20px; border-right:3px solid #eee; padding-right:15px;">
                                <div class="sub-q-title" style="font-weight:bold; color:#3498db; margin-bottom:5px;">סעיף ${label}' (${sq.points} נק')</div>
                                <div class="sub-q-text" id="q-text-${q.id}-${si}">${sq.text}</div>
                                <div class="answer-area" style="margin-top:10px;">
                                    <textarea class="student-ans" id="student-ans-${q.id}-${si}" placeholder="תשובה לסעיף ${label}'..." onpaste="return false;" style="height:10vh;"></textarea>
                                </div>
                                <div class="grading-area">
                                    <div style="display:flex; align-items:center; gap:1vw;">
                                        <label>ניקוד:</label>
                                        <input type="number" class="grade-input" id="grade-input-${q.id}-${si}" min="0" max="${sq.points}" oninput="calcTotal()" disabled>
                                        <span class="grade-max">מתוך ${sq.points}</span>
                                    </div>
                                    <input type="text" class="teacher-comment" id="comment-input-${q.id}-${si}" placeholder="הערה מילולית..." disabled style="width: 100%; margin-top: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                    ${sqModelAns}
                                </div>
                            </div>`;
                        }).join('');
                    } else {
                        modelAnsHtml = q.modelAnswer ? `<div class="model-answer-secret" style="display:none; margin-top:15px; background:#fff3cd; color:#856404; padding:10px; border-radius:5px; border:1px solid #ffeeba;"><strong>🔑 תשובה לדוגמא (למורה):</strong><br><div style="white-space:pre-wrap; margin-top:5px;" id="model-ans-text-${q.id}" class="model-ans-text-content">${q.modelAnswer}</div></div>` : '';
                        interactionHTML = `<div class="answer-area"><label>תשובה:</label><textarea class="student-ans" id="student-ans-${q.id}" placeholder="כתוב את תשובתך כאן..." onpaste="return false;"></textarea></div>`;
                        gradingHTML = `
                        <div class="grading-area">
                            <div style="display:flex; align-items:center; gap:1vw;">
                                <label>ניקוד:</label>
                                <input type="number" class="grade-input" id="grade-input-${q.id}" min="0" max="${q.points}" oninput="calcTotal()" disabled>
                                <span class="grade-max">מתוך ${q.points}</span>
                            </div>
                            <input type="text" class="teacher-comment" id="comment-input-${q.id}" placeholder="הערה מילולית למורה..." disabled style="width: 100%; margin-top: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            ${modelAnsHtml}
                        </div>`;
                    }

                    return `<div class="q-block" id="question-block-${q.id}">
                        <div class="q-header">
                            <span class="q-points">(${q.points} נק' סה"כ)</span>
                            <strong id="q-label-${q.id}">שאלה ${qIdx+1}:</strong>
                        </div>
                        <div class="q-content" id="q-main-text-${q.id}">${q.text}</div>
                        ${img}${vid}
                        ${interactionHTML}
                        ${gradingHTML}
                    </div>`;
                }).join('');
            }
            return `<div id="part-${p.id}" class="exam-section ${idx===0?'active':''}">
                <h2 style="color:#2c3e50; border-bottom:0.3vh solid #3498db; font-weight: 700; padding-bottom:1vh; margin-bottom:3vh;">${p.name}</h2>
                ${partInstrHtml}${qHtml}</div>`;
        }).join('');

        const globalInstructionsHTML = instructions.general ? `<div class="instructions-box global-instructions"><h3>הנחיות כלליות</h3><div class="instructions-text">${instructions.general}</div></div>` : '';
        const logoHTML = logoData ? `<img src="${logoData}" alt="Logo" class="school-logo">` : '';
        const embeddedProjectData = projectData ? `<script type="application/json" id="exam-engine-data">${JSON.stringify(projectData).replace(/<\/script>/g, '<\\/script>')}</script>` : '';

        return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>${examTitle} - ${studentName}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap"><style>
        :root{--primary:#2c3e50;--accent:#3498db;--success:#27ae60;--danger:#e74c3c;}
        body{font-family:'Rubik',sans-serif;background:#f4f6f8;margin:0;padding:2%;color:#2c3e50;font-size:18px;line-height:1.5;} 
        .container{max-width:800px;margin:0 auto;background:white;padding:5%;border-radius:1em;box-shadow:0 1vh 3vh rgba(0,0,0,0.05);}
        textarea{width:100%;height:20vh;padding:2vh;border:1px solid #ccc;border-radius:0.8em;font-family:inherit;font-size:1rem;}
        button{cursor:pointer;}
        .tab-btn{padding:10px 20px;background:#eee;border:none;margin:5px;border-radius:20px;font-size:1rem;}
        .tab-btn.active{background:var(--accent);color:white;}
        .exam-section{display:none;}
        .exam-section.active{display:block;}
        .part-instructions { background: #e8f6f3; border-right: 4px solid #1abc9c; padding: 15px; margin-bottom: 20px; border-radius: 4px; color: #16a085; font-size: 1.05em; line-height: 1.5; display: block !important; width: 100%; box-sizing: border-box; }
        .school-logo { display: block; margin: 0 auto 20px auto; max-width: 200px; max-height: 150px; width: auto; height: auto; object-fit: contain; }
        
        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; width: 100%; max-width: 100%; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .video-shield { position: absolute; top: 0; left: 0; width: 100%; height: 15%; z-index: 10; background: transparent; }
        .image-wrapper { text-align: center; margin: 20px 0; width: 100%; }
        .image-wrapper img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: block; margin: 0 auto; }

        .teacher-controls { background: #fdf2e9; padding: 15px; border: 1px solid #f39c12; border-radius: 8px; margin-bottom: 20px; }
        .grading-area { display: none; margin-top: 15px; background: #fafafa; padding: 10px; border-top: 2px solid #bdc3c7; }
        .grade-input { width: 60px; padding: 5px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-weight: bold; }
        .teacher-comment { background: #fff; }
        .model-answer-secret { margin-top: 10px; border: 1px dashed #f39c12; padding: 10px; background: #fffdf5; border-radius: 4px; font-size: 0.9em; color: #555; }
        
        #highlighterTool { position: fixed; top: 150px; right: 20px; width: 50px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border-radius: 30px; padding: 15px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 10000; border: 1px solid #ddd; transition: opacity 0.3s; }
        .color-btn { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: transform 0.2s; display: flex; align-items: center; justify-content: center; overflow: hidden;}
        .color-btn:hover { transform: scale(1.2); }
        .color-btn.active { border-color: #333; transform: scale(1.1); box-shadow: 0 0 0 2px #333; }
        .drag-handle { cursor: move; color: #ccc; font-size: 20px; line-height: 10px; margin-bottom: 5px; user-select: none; }
        
        #startScreen,#timesUpModal,#securityModal,#successModal{position:fixed;top:0;left:0;width:100%;height:100%;background:#2c3e50;color:white;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:9999;}#timesUpModal,#securityModal,#successModal{display:none;}
        #timerBadge{position:fixed;top:10px;left:10px;background:white;color:black;padding:10px;border-radius:20px;border:2px solid #2c3e50;font-weight:bold;z-index:5000;display:none;}
        </style></head><body>
        ${embeddedProjectData}
        
        <div id="highlighterTool">
            <div class="drag-handle" id="hlDragHandle">:::</div>
            <div class="color-btn" style="background:#ffeb3b;" onclick="setMarker('#ffeb3b', this)" title="צהוב"></div>
            <div class="color-btn" style="background:#a6ff00;" onclick="setMarker('#a6ff00', this)" title="ירוק"></div>
            <div class="color-btn" style="background:#ff4081;" onclick="setMarker('#ff4081', this)" title="ורוד"></div>
            <div class="color-btn" style="background:#00e5ff;" onclick="setMarker('#00e5ff', this)" title="תכלת"></div>
            <div class="color-btn" style="background:#eee; border:1px solid #999;" onclick="setMarker('eraser', this)" title="מחק סימון">🧽</div>
            <div class="color-btn" style="background:#fff; border:1px solid #ccc; font-size:12px;" onclick="setMarker(null, this)" title="בטל כלי">❌</div>
        </div>

        <div id="startScreen">
            <h1>${examTitle}</h1>
            <p style="font-size: 1.2em; margin-bottom: 20px;">משך הבחינה: ${duration} דקות</p>
            <button onclick="startExamTimer()" style="padding:15px 30px;font-size:1.5em;background:#27ae60;color:white;border:none;border-radius:10px;">התחל בחינה (מסך מלא)</button>
        </div>
        
        <div id="timerBadge">זמן: <span id="timerText">--:--</span></div>
        <div id="timesUpModal"><h2>הזמן נגמר!</h2><button onclick="submitExam()">הגש בחינה</button></div>
        <div id="securityModal"><h2>המבחן ננעל!</h2><input type="password" id="teacherCodeInput" placeholder="קוד מורה"><button onclick="unlockExam()">שחרר</button></div>
        
        <div id="successModal">
            <h1>המבחן הוגש בהצלחה!</h1>
            <div id="submissionActions"></div>
            <button onclick="enableGradingFromModal()" style="margin-top:20px; background:transparent; border:1px solid #fff; color:#fff; padding:10px;">👨‍🏫 מורה? כניסה לבדיקה</button>
        </div>
        
        <div class="container" id="mainContainer" style="filter:blur(5px);">
            <div style="text-align:center;">${logoHTML}<h1>${examTitle}</h1></div>
            <div class="teacher-controls" style="display:none;">
                <h3 style="color:#d35400;">👨‍🏫 בדיקה</h3>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>ציון: <span id="teacherCalculatedScore">0</span></span>
                    <button onclick="saveGradedExam()" style="width:auto; background:#27ae60; color:white;">💾 שמור בדיקה</button>
                </div>
            </div>
            <div style="background:#fff;padding:20px;border:1px solid var(--accent);border-radius:10px;margin-bottom:20px;"><label>שם תלמיד:</label><input type="text" id="studentNameField" value="${studentName}" style="width:100%;padding:10px;"></div>
            ${globalInstructionsHTML}
            <div class="tabs" id="examTabs">${tabsHTML}</div>
            <form id="examForm">${sectionsHTML}</form>
            <div style="text-align:center;margin-top:50px;"><button onclick="submitExam()" style="background:#27ae60;color:white;padding:15px 30px;border-radius:30px;">הגש בחינה</button></div>
        </div>

        <script>
        let totalTime=${duration}*60,timerInterval,examStarted=false,markerColor=null;
        
        function setMarker(color, btn) {
            markerColor = color;
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            if(btn) btn.classList.add('active');
            
            const container = document.getElementById('mainContainer');
            
            if(color) {
                container.contentEditable = "true";
                document.body.style.cursor = (color === 'eraser') ? "help" : "crosshair";
            } else {
                container.contentEditable = "false";
                document.body.style.cursor = "default";
            }
        }

        document.getElementById('mainContainer').addEventListener('keydown', (e) => {
            if (markerColor && !e.target.closest('textarea') && !e.target.closest('input')) {
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (!markerColor) return;
            if(e.target.closest('textarea') || e.target.closest('input') || e.target.closest('#highlighterTool')) return;

            const sel = window.getSelection();
            if (sel.rangeCount > 0 && !sel.isCollapsed) {
                if(markerColor === 'eraser') {
                    document.execCommand("hiliteColor", false, "transparent");
                } else {
                    document.execCommand("styleWithCSS", false, true);
                    document.execCommand("hiliteColor", false, markerColor);
                }
                sel.removeAllRanges();
            }
        });

        const tool = document.getElementById('highlighterTool');
        const handle = document.getElementById('hlDragHandle');
        let isDragging = false, startX, startY, initialLeft, initialTop;
        handle.onmousedown = function(e) {
            e.preventDefault(); isDragging=true; startX=e.clientX; startY=e.clientY; initialLeft=tool.offsetLeft; initialTop=tool.offsetTop;
            document.onmouseup = () => isDragging=false;
            document.onmousemove = (e) => {
                if(!isDragging) return;
                tool.style.top=(initialTop+e.clientY-startY)+"px";
                tool.style.left=(initialLeft+e.clientX-startX)+"px";
                tool.style.right='auto';
            };
        };

        function simpleHash(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return h.toString();}
        function startExamTimer(){
            document.documentElement.requestFullscreen().catch(e=>console.log(e));
            document.getElementById('startScreen').style.display='none';
            document.getElementById('mainContainer').style.filter='none';
            document.getElementById('timerBadge').style.display='block';
            examStarted=true; runTimer();
        }
        function runTimer(){timerInterval=setInterval(()=>{totalTime--;updateTimer();if(totalTime<=0){clearInterval(timerInterval);document.getElementById('timesUpModal').style.display='flex';}},1000);}
        function updateTimer(){let m=Math.floor(totalTime/60),s=totalTime%60;document.getElementById('timerText').innerText=(m<10?'0'+m:m)+':'+(s<10?'0'+s:s);}
        function showPart(id){document.querySelectorAll('.exam-section').forEach(e=>e.classList.remove('active'));document.getElementById('part-'+id).classList.add('active');document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));if(event.target.classList.contains('tab-btn')) event.target.classList.add('active');}
        function calcTotal(){let t=0;document.querySelectorAll('.grade-input').forEach(i=>{if(i.value)t+=parseFloat(i.value);});document.getElementById('teacherCalculatedScore').innerText=t;}
        function submitExam(){
            document.body.dataset.status='submitted'; if(document.fullscreenElement)document.exitFullscreen();
            clearInterval(timerInterval);
            document.getElementById('mainContainer').contentEditable = "false";
            document.querySelectorAll('input,textarea').forEach(e=>{e.setAttribute('value',e.value); if(e.tagName==='TEXTAREA')e.innerHTML=e.value;});
            const html="<!DOCTYPE html>"+document.documentElement.outerHTML;
            const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([html],{type:'text/html'})); 
            // שינוי שם הקובץ לשם המבחן
            a.download="${examTitle} - פתור - " + (document.getElementById('studentNameField').value || 'תלמיד') + ".html"; a.click();
            document.getElementById('successModal').style.display='flex';
        }
        function enableGradingFromModal(){if(simpleHash(prompt('קוד:'))==="${unlockCodeHash}"){document.getElementById('successModal').style.display='none';document.querySelector('.teacher-controls').style.display='block';document.querySelectorAll('.grading-area').forEach(e=>e.style.display='block');document.querySelectorAll('.grade-input,.teacher-comment').forEach(e=>e.disabled=false);}}
        function saveGradedExam(){
            document.querySelectorAll('input,textarea').forEach(i=>i.setAttribute('value',i.value));
            const html="<!DOCTYPE html>"+document.documentElement.outerHTML;
            const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));
            // שינוי שם הקובץ בבדיקה לשם המבחן
            a.download="${examTitle} - בדוק - " + (document.getElementById('studentNameField').value || 'תלמיד') + ".html"; a.click();
        }
        <\/script></body></html>`;
    }
};
