/**
 * HTMLBuilder - מנהל את יצירת קובץ ה-HTML הסופי של המבחן
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
                                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                                        <label>ניקוד:</label>
                                        <input type="number" class="grade-input" id="grade-input-${q.id}-${si}" min="0" max="${sq.points}" oninput="calcTotal()" disabled>
                                        <span class="grade-max">מתוך ${sq.points}</span>
                                    </div>
                                    <input type="text" class="teacher-comment" id="comment-input-${q.id}-${si}" placeholder="הערה לסעיף ${label}'..." disabled style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                    ${sqModelAns}
                                </div>
                            </div>`;
                        }).join('');
                    } else {
                        modelAnsHtml = q.modelAnswer ? `<div class="model-answer-secret" style="display:none; margin-top:15px; background:#fff3cd; color:#856404; padding:10px; border-radius:5px; border:1px solid #ffeeba;"><strong>🔑 תשובה לדוגמא (למורה):</strong><br><div style="white-space:pre-wrap; margin-top:5px;" id="model-ans-text-${q.id}" class="model-ans-text-content">${q.modelAnswer}</div></div>` : '';
                        interactionHTML = `<div class="answer-area"><label>תשובה:</label><textarea class="student-ans" id="student-ans-${q.id}" placeholder="כתוב את תשובתך כאן..." onpaste="return false;"></textarea></div>`;
                        gradingHTML = `
                        <div class="grading-area">
                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                                <label>ניקוד:</label>
                                <input type="number" class="grade-input" id="grade-input-${q.id}" min="0" max="${q.points}" oninput="calcTotal()" disabled>
                                <span class="grade-max">מתוך ${q.points}</span>
                            </div>
                            <input type="text" class="teacher-comment" id="comment-input-${q.id}" placeholder="הערה לשאלה..." disabled style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            ${modelAnsHtml}
                        </div>`;
                    }

                    return `<div class="q-block" id="question-block-${q.id}">
                        <div class="q-header" style="margin-bottom:10px;">
                            <span class="q-points" style="color:#7f8c8d; font-size:0.9rem;">(${q.points} נק' סה"כ)</span>
                            <strong id="q-label-${q.id}">שאלה ${qIdx+1}:</strong>
                        </div>
                        <div class="q-content" id="q-main-text-${q.id}" style="margin-bottom:15px; line-height:1.6;">${q.text}</div>
                        ${img}${vid}
                        ${interactionHTML}
                        ${gradingHTML}
                    </div><hr style="border:0; border-top:1px solid #eee; margin:30px 0;">`;
                }).join('');
            }
            return `<div id="part-${p.id}" class="exam-section ${idx===0?'active':''}">
                <h2 style="color:#2c3e50; border-bottom:3px solid #3498db; font-weight: 700; padding-bottom:10px; margin-bottom:20px;">${p.name}</h2>
                ${partInstrHtml}${qHtml}</div>`;
        }).join('');

        const globalInstructionsHTML = instructions.general ? `<div class="instructions-box" style="background:#f8f9fa; padding:20px; border-right:5px solid #3498db; margin-bottom:30px;"><h3>הנחיות כלליות</h3><div class="instructions-text">${instructions.general.replace(/\n/g, '<br>')}</div></div>` : '';
        const logoHTML = logoData ? `<img src="${logoData}" alt="Logo" class="school-logo" style="max-height:100px; display:block; margin:0 auto 20px;">` : '';
        const embeddedProjectData = projectData ? `<script type="application/json" id="exam-engine-data">${JSON.stringify(projectData).replace(/<\/script>/g, '<\\/script>')}</script>` : '';

        return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>מבחן - ${studentName}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap"><style>
        :root{--primary:#2c3e50;--accent:#3498db;--success:#27ae60;--danger:#e74c3c;}
        body{font-family:'Rubik',sans-serif;background:#f4f6f8;margin:0;padding:2%;color:#2c3e50;font-size:18px;line-height:1.5;} 
        .container{max-width:850px;margin:0 auto;background:white;padding:40px;border-radius:1em;box-shadow:0 10px 30px rgba(0,0,0,0.05);}
        textarea{width:100%;height:150px;padding:15px;border:1px solid #ccc;border-radius:8px;font-family:inherit;font-size:1rem;box-sizing:border-box;}
        button{cursor:pointer; font-family:inherit;}
        .tab-btn{padding:10px 20px;background:#eee;border:none;margin:5px;border-radius:20px;font-size:1rem; transition:all 0.2s;}
        .tab-btn.active{background:var(--accent);color:white;}
        .exam-section{display:none;}
        .exam-section.active{display:block;}
        .part-instructions { background: #e8f6f3; border-right: 4px solid #1abc9c; padding: 15px; margin-bottom: 20px; border-radius: 4px; color: #16a085; }
        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0; border-radius: 8px; }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .image-wrapper img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 20px auto; }
        .grading-area { display: none; margin-top: 15px; background: #fdfdfd; padding: 15px; border: 1px solid #eee; border-radius: 8px; }
        .grade-input { width: 70px; padding: 5px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-weight: bold; }
        #highlighterTool { position: fixed; top: 150px; right: 20px; width: 50px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border-radius: 30px; padding: 15px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 10000; border: 1px solid #ddd; }
        .color-btn { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: transform 0.2s; position:relative;}
        .color-btn:hover { transform: scale(1.1); }
        .color-btn.active { box-shadow: 0 0 0 2px #2c3e50; }
        #startScreen,#timesUpModal,#securityModal,#successModal{position:fixed;top:0;left:0;width:100%;height:100%;background:#2c3e50;color:white;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:9999; text-align:center; padding:20px;}
        #timesUpModal,#securityModal,#successModal{display:none;}
        #timerBadge{position:fixed;top:20px;left:20px;background:white;color:black;padding:10px 20px;border-radius:30px;box-shadow:0 4px 10px rgba(0,0,0,0.2);font-weight:bold;z-index:5000;display:none; font-size:1.2rem;}
        </style></head><body>
        ${embeddedProjectData}
        <div id="highlighterTool">
            <div class="color-btn" style="background:#ffeb3b;" onclick="setMarker('#ffeb3b', this)" title="מרקר צהוב"></div>
            <div class="color-btn" style="background:#a6ff00;" onclick="setMarker('#a6ff00', this)" title="מרקר ירוק"></div>
            <div class="color-btn" style="background:#00e5ff;" onclick="setMarker('#00e5ff', this)" title="מרקר כחול"></div>
            <div class="color-btn" style="background:#fff; border:1px solid #ccc; display:flex; justify-content:center; align-items:center; font-size:16px;" onclick="setMarker('eraser', this)" title="מחק סימון">🧹</div>
        </div>

        <div id="startScreen">
            <h1>${examTitle}</h1>
            <p style="font-size: 1.4em;">משך הבחינה: ${duration} דקות</p>
            <div style="background:rgba(255,255,255,0.1); padding:20px; border-radius:15px; margin:20px 0; max-width:500px;">
                <p>🔊 <strong>בדיקת שמע:</strong> ודא שהאוזניות מחוברות והווליום תקין.</p>
                <button onclick="playTestSound()" style="background:#3498db; color:white; border:none; padding:10px 20px; border-radius:5px;">▶️ נגן צליל בדיקה</button>
            </div>
            <button onclick="startExamTimer()" style="padding:20px 40px; font-size:1.5em; background:#27ae60; color:white; border:none; border-radius:10px; font-weight:bold;">התחל בחינה</button>
        </div>
        
        <div id="timerBadge">⏳ <span id="timerText">--:--</span></div>
        
        <div id="securityModal">
            <h2>המבחן ננעל!</h2>
            <p>בוצעה יציאה ממסך מלא או מעבר לחלון אחר.</p>
            <input type="password" id="teacherCodeInput" placeholder="קוד מורה לשחרור" style="padding:10px; border-radius:5px; border:none; margin:10px; width:200px; text-align:center;">
            <button onclick="unlockExam()" style="padding:10px 20px; background:#e74c3c; color:white; border:none; border-radius:5px;">שחרר מבחן</button>
        </div>

        <div id="successModal">
            <h1>המבחן הוגש בהצלחה!</h1>
            <p>הקובץ פתור ירד למחשבך כעת.</p>
            <div id="submissionActions"></div>
            <button onclick="enableGradingFromModal()" style="margin-top:40px; background:none; border:1px solid #fff; color:#fff; padding:5px 15px; border-radius:5px; opacity:0.6;">👨‍🏫 מצב בדיקה (למורה)</button>
        </div>
        
        <div class="container" id="mainContainer" style="filter:blur(10px); transition: filter 0.5s;">
            <div style="text-align:center;">${logoHTML}<h1>${examTitle}</h1></div>
            
            <div class="teacher-controls" style="display:none; background:#fff3e0; padding:20px; border:2px solid #ff9800; border-radius:10px; margin-bottom:30px;">
                <h3 style="margin-top:0;">👨‍🏫 בודק המבחן: <span id="gradingStudentName"></span></h3>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:1.3rem; font-weight:bold;">ציון סופי: <span id="teacherCalculatedScore" style="color:#e67e22;">0</span></div>
                    <div>
                        <button onclick="saveGradedExam()" style="background:#27ae60; color:white; padding:10px 15px; border-radius:5px;">💾 שמור בדיקה (HTML)</button>
                        <button onclick="exportToDoc()" style="background:#2980b9; color:white; padding:10px 15px; border-radius:5px; margin-right:10px;">📄 ייצא ל-Word</button>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:30px;"><label>שם תלמיד:</label><input type="text" id="studentNameField" value="${studentName}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;"></div>
            ${globalInstructionsHTML}
            <div class="tabs">${tabsHTML}</div>
            <form id="examForm" onsubmit="return false;">${sectionsHTML}</form>
            
            <div style="text-align:center; margin-top:50px;">
                <button onclick="submitExam()" style="background:#27ae60; color:white; padding:20px 50px; font-size:1.3rem; border:none; border-radius:40px; font-weight:bold; box-shadow:0 4px 15px rgba(39, 174, 96, 0.3);">הגש בחינה</button>
            </div>
        </div>

        <script>
        let totalTime=${duration}*60, timerInterval, examStarted=false;
        function simpleHash(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return h.toString();}
        
        function playTestSound() {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 440; osc.start();
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
            osc.stop(ctx.currentTime + 1);
        }

        function startExamTimer(){
            document.documentElement.requestFullscreen().catch(() => {});
            document.getElementById('startScreen').style.display='none';
            document.getElementById('mainContainer').style.filter='none';
            document.getElementById('timerBadge').style.display='block';
            examStarted=true;
            runTimer();
        }

        function runTimer(){
            clearInterval(timerInterval);
            timerInterval=setInterval(()=>{
                totalTime--;
                let m=Math.floor(totalTime/60), s=totalTime%60;
                document.getElementById('timerText').innerText=(m<10?'0'+m:m)+':'+(s<10?'0'+s:s);
                if(totalTime<=0){ clearInterval(timerInterval); submitExam(); }
            },1000);
        }

        function showPart(id){
            document.querySelectorAll('.exam-section').forEach(e=>e.classList.remove('active'));
            document.getElementById('part-'+id).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            event.target.classList.add('active');
        }

        let currentMarker = null;
        function setMarker(color, btn) {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            if (currentMarker === color) {
                currentMarker = null;
                document.body.style.cursor = 'default';
            } else {
                currentMarker = color;
                btn.classList.add('active');
                document.body.style.cursor = color === 'eraser' ? 'crosshair' : 'text';
            }
        }

        document.addEventListener('mouseup', () => {
            if (!currentMarker) return;
            const sel = window.getSelection();
            if (sel.rangeCount > 0 && !sel.isCollapsed) {
                document.designMode = "on";
                if (currentMarker === 'eraser') {
                    document.execCommand("hiliteColor", false, "transparent");
                } else {
                    document.execCommand("hiliteColor", false, currentMarker);
                }
                document.designMode = "off";
                sel.removeAllRanges();
            }
        });

        function lockExam(){ 
            if(!examStarted || document.body.dataset.status==='submitted') return;
            clearInterval(timerInterval); 
            document.getElementById('securityModal').style.display='flex'; 
        }

        window.addEventListener('blur', lockExam);
        document.addEventListener('fullscreenchange', () => { if(!document.fullscreenElement && examStarted) lockExam(); });

        function unlockExam(){
            if(simpleHash(document.getElementById('teacherCodeInput').value)==="${unlockCodeHash}"){
                document.getElementById('securityModal').style.display='none';
                document.documentElement.requestFullscreen().catch(()=>{});
                runTimer();
            } else { alert('קוד שגוי'); }
        }

        function submitExam(){
            if(document.body.dataset.status==='submitted') return;
            document.body.dataset.status='submitted';
            clearInterval(timerInterval);
            if(document.fullscreenElement) document.exitFullscreen();
            
            // שמירת ערכים ב-DOM לפני הורדה
            document.querySelectorAll('input,textarea').forEach(e => {
                e.setAttribute('value', e.value);
                if(e.tagName === 'TEXTAREA') e.innerHTML = e.value;
            });

            const html = "<!DOCTYPE html>" + document.documentElement.outerHTML;
            const blob = new Blob([html], {type:'text/html'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "פתור-" + (document.getElementById('studentNameField').value || 'תלמיד') + ".html";
            a.click();

            document.getElementById('successModal').style.display='flex';
            document.getElementById('timerBadge').style.display='none';

            // פתיחת דרייב אוטומטית אם קיים
            if("${driveLink}") {
                window.open("${driveLink}", "_blank");
            }
        }

        function calcTotal(){
            let total = 0;
            document.querySelectorAll('.grade-input').forEach(i => {
                if(i.value) total += parseFloat(i.value);
            });
            document.getElementById('teacherCalculatedScore').innerText = total;
        }

        function enableGradingFromModal() {
            if(simpleHash(prompt('הכנס קוד מורה לבדיקה:'))==="${unlockCodeHash}") {
                document.getElementById('successModal').style.display='none';
                enableGradingUI();
            } else { alert('קוד שגוי'); }
        }

        function enableGradingUI() {
            document.body.dataset.status = 'grading';
            document.getElementById('mainContainer').style.filter = 'none';
            document.querySelector('.teacher-controls').style.display = 'block';
            document.getElementById('gradingStudentName').innerText = document.getElementById('studentNameField').value;
            document.querySelectorAll('.grading-area').forEach(e => e.style.display = 'block');
            document.querySelectorAll('.grade-input, .teacher-comment').forEach(e => e.disabled = false);
            document.querySelectorAll('.model-answer-secret').forEach(e => e.style.display = 'block');
            document.querySelectorAll('.exam-section').forEach(e => e.style.display = 'block');
            document.querySelectorAll('.tab-btn').forEach(b => b.style.display = 'none');
            calcTotal();
        }

        function saveGradedExam(){
            document.querySelectorAll('input,textarea').forEach(i => i.setAttribute('value', i.value));
            document.querySelectorAll('textarea').forEach(t => t.innerHTML = t.value);
            const html = "<!DOCTYPE html>" + document.documentElement.outerHTML;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([html], {type:'text/html'})); 
            a.download = "בדוק-" + document.getElementById('studentNameField').value + ".html";
            a.click();
        }

        function exportToDoc() {
            const studentName = document.getElementById('studentNameField').value || 'תלמיד';
            const finalScore = document.getElementById('teacherCalculatedScore').innerText || '0';
            let content = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">';
            content += '<head><meta charset="utf-8"><style>body{font-family: Arial; direction: rtl;} .q{border:1px solid #ccc; padding:10px; margin:10px 0;} .feedback{color:blue; font-style:italic;}</style></head><body>';
            content += '<h1>סיכום בדיקה: ' + document.querySelector('h1').innerText + '</h1>';
            content += '<h2>תלמיד: ' + studentName + ' | ציון סופי: ' + finalScore + '</h2><hr>';
            
            document.querySelectorAll('.q-block').forEach(q => {
                const label = q.querySelector('strong').innerText;
                const text = q.querySelector('.q-content').innerText;
                content += '<div class="q"><h3>' + label + '</h3><p>' + text + '</p>';
                
                const subQuestions = q.querySelectorAll('.sub-question-block');
                if(subQuestions.length > 0) {
                    subQuestions.forEach(sq => {
                        const sqTitle = sq.querySelector('.sub-q-title').innerText;
                        const sqAns = sq.querySelector('textarea').value;
                        const sqGrade = sq.querySelector('.grade-input').value;
                        const sqComment = sq.querySelector('.teacher-comment').value;
                        content += '<div style="margin-right:20px;"><h4>' + sqTitle + '</h4><p>תשובה: ' + sqAns + '</p>';
                        content += '<p class="feedback">ציון: ' + sqGrade + ' | הערה: ' + sqComment + '</p></div>';
                    });
                } else {
                    const ans = q.querySelector('textarea').value;
                    const grade = q.querySelector('.grade-input').value;
                    const comment = q.querySelector('.teacher-comment').value;
                    content += '<p>תשובה: ' + ans + '</p>';
                    content += '<p class="feedback">ציון: ' + grade + ' | הערה: ' + comment + '</p>';
                }
                content += '</div>';
            });
            content += '</body></html>';
            const blob = new Blob(['\\ufeff', content], {type:'application/msword'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = 'בדוק-' + studentName + '.doc';
            link.click();
        }
        <\/script></body></html>`;
    }
};