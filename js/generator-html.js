/**
 * HTMLBuilder - מחולל את קובץ המבחן האינטראקטיבי הסופי
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
                                <div class="grading-area" style="display:none; margin-top:10px; background:#f9f9f9; padding:10px; border-radius:8px;">
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <label>ניקוד לסעיף:</label>
                                        <input type="number" class="grade-input" id="grade-input-${q.id}-${si}" min="0" max="${sq.points}" placeholder="0" oninput="calcTotal()" style="width:60px; padding:5px; font-weight:bold;">
                                        <span style="font-size:0.9em; color:#666;">מתוך ${sq.points}</span>
                                    </div>
                                    <input type="text" class="teacher-comment" id="comment-input-${q.id}-${si}" placeholder="הערה לסעיף זה..." style="width:100%; margin-top:5px; padding:5px; border:1px solid #ddd;">
                                    ${sqModelAns}
                                </div>
                            </div>`;
                        }).join('');
                    } else {
                        modelAnsHtml = q.modelAnswer ? `<div class="model-answer-secret" style="display:none; margin-top:15px; background:#fff3cd; color:#856404; padding:10px; border-radius:5px; border:1px solid #ffeeba;"><strong>🔑 תשובה לדוגמא (מחוון):</strong><br><div style="white-space:pre-wrap; margin-top:5px;" id="model-ans-text-${q.id}" class="model-ans-text-content">${q.modelAnswer}</div></div>` : '';
                        interactionHTML = `<div class="answer-area"><label>תשובה:</label><textarea class="student-ans" id="student-ans-${q.id}" placeholder="כתוב את תשובתך כאן..." onpaste="return false;"></textarea></div>`;
                        gradingHTML = `
                        <div class="grading-area" style="display:none; margin-top:15px; background:#f9f9f9; padding:15px; border-radius:8px; border-right:4px solid #f39c12;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <label style="font-weight:bold;">ניקוד לשאלה:</label>
                                <input type="number" class="grade-input" id="grade-input-${q.id}" min="0" max="${q.points}" placeholder="0" oninput="calcTotal()" style="width:70px; padding:8px; font-size:1.1em; font-weight:bold; border:2px solid #f39c12; border-radius:5px;">
                                <span style="font-weight:bold;">מתוך ${q.points}</span>
                            </div>
                            <textarea class="teacher-comment" id="comment-input-${q.id}" placeholder="הערות המורה לשאלה זו..." style="width: 100%; margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; height:60px;"></textarea>
                            ${modelAnsHtml}
                        </div>`;
                    }

                    return `<div class="q-block" id="question-block-${q.id}" style="margin-bottom:40px; border-bottom:1px solid #eee; padding-bottom:20px;">
                        <div class="q-header" style="margin-bottom:15px;">
                            <span class="q-points" style="background:#34495e; color:white; padding:2px 10px; border-radius:15px; font-size:0.85em;">${q.points} נק'</span>
                            <strong id="q-label-${q.id}" style="font-size:1.2em; margin-right:10px;">שאלה ${qIdx+1}:</strong>
                        </div>
                        <div class="q-content" id="q-main-text-${q.id}" style="font-size:1.1em; margin-bottom:15px; line-height:1.6;">${q.text}</div>
                        ${img}${vid}
                        ${interactionHTML}
                        ${gradingHTML}
                    </div>`;
                }).join('');
            }
            return `<div id="part-${p.id}" class="exam-section ${idx===0?'active':''}">
                <h2 style="color:#2c3e50; border-bottom:3px solid #3498db; font-weight: 700; padding-bottom:10px; margin-bottom:25px;">${p.name}</h2>
                ${partInstrHtml}${qHtml}</div>`;
        }).join('');

        const globalInstructionsHTML = instructions.general ? `<div class="instructions-box global-instructions" style="background:#fdfefe; border:1px solid #d1d1d1; padding:20px; border-radius:10px; margin-bottom:30px;"><h3>📋 הנחיות כלליות</h3><div class="instructions-text">${instructions.general}</div></div>` : '';
        const logoHTML = logoData ? `<img src="${logoData}" alt="Logo" class="school-logo" style="max-height:100px; margin-bottom:20px;">` : '';
        const embeddedProjectData = projectData ? `<script type="application/json" id="exam-engine-data">${JSON.stringify(projectData).replace(/<\/script>/g, '<\\/script>')}</script>` : '';

        return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>${examTitle} - ${studentName}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap"><style>
        :root{--primary:#2c3e50;--accent:#3498db;--success:#27ae60;--danger:#e74c3c;}
        body{font-family:'Rubik',sans-serif;background:#f4f6f8;margin:0;padding:2%;color:#2c3e50;font-size:18px;line-height:1.5;} 
        .container{max-width:900px;margin:0 auto;background:white;padding:40px;border-radius:1em;box-shadow:0 10px 30px rgba(0,0,0,0.05);}
        textarea{width:100%;height:150px;padding:15px;border:1px solid #ccc;border-radius:8px;font-family:inherit;font-size:1rem; box-sizing:border-box;}
        button{cursor:pointer; transition:all 0.2s;}
        .tab-btn{padding:12px 25px;background:#eee;border:none;margin:5px;border-radius:25px;font-size:1rem;font-weight:500;}
        .tab-btn.active{background:var(--accent);color:white;box-shadow:0 4px 10px rgba(52, 152, 219, 0.3);}
        .exam-section{display:none;}
        .exam-section.active{display:block;}
        .part-instructions { background: #e8f6f3; border-right: 5px solid #1abc9c; padding: 20px; margin-bottom: 25px; border-radius: 5px; color: #16a085; }
        
        .teacher-header { background: #fff3cd; border: 2px solid #ffeeba; padding: 20px; border-radius: 10px; margin-bottom: 30px; display: none; }
        .final-score-badge { background: #27ae60; color: white; padding: 10px 20px; border-radius: 50px; font-size: 1.5rem; font-weight: 900; }

        #highlighterTool { position: fixed; top: 150px; right: 20px; width: 50px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border-radius: 30px; padding: 15px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 10000; border: 1px solid #ddd; }
        .color-btn { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .color-btn.active { outline: 2px solid #333; outline-offset: 2px; }
        
        #startScreen,#successModal{position:fixed;top:0;left:0;width:100%;height:100%;background:#2c3e50;color:white;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:9999;text-align:center;padding:20px;}
        #timerBadge{position:fixed;top:15px;left:15px;background:white;color:black;padding:10px 20px;border-radius:30px;border:2px solid #2c3e50;font-weight:bold;z-index:5000;display:none;box-shadow:0 4px 10px rgba(0,0,0,0.1);}
        
        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0; border-radius: 10px; }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .image-wrapper img { max-width: 100%; height: auto; border-radius: 10px; display: block; margin: 20px auto; }
        </style></head><body>
        ${embeddedProjectData}
        
        <div id="highlighterTool">
            <div style="cursor:move; color:#ccc; margin-bottom:10px;">:::</div>
            <div class="color-btn" style="background:#ffeb3b;" onclick="setMarker('#ffeb3b', this)"></div>
            <div class="color-btn" style="background:#a6ff00;" onclick="setMarker('#a6ff00', this)"></div>
            <div class="color-btn" style="background:#ff4081;" onclick="setMarker('#ff4081', this)"></div>
            <div class="color-btn" style="background:#eee; display:flex; align-items:center; justify-content:center;" onclick="setMarker('eraser', this)">🧽</div>
            <div class="color-btn" style="background:#fff; border:1px solid #ccc; font-size:12px; display:flex; align-items:center; justify-content:center;" onclick="setMarker(null, this)">❌</div>
        </div>

        <div id="startScreen">
            <h1 style="font-size:3rem;">${examTitle}</h1>
            <p style="font-size:1.5rem; margin:20px 0;">שם התלמיד: ${studentName}</p>
            <p>זמן מוקצב: ${duration} דקות</p>
            <button onclick="startExamTimer()" style="padding:20px 50px; font-size:1.8rem; background:#27ae60; color:white; border:none; border-radius:50px; margin-top:30px;">התחל מבחן</button>
        </div>
        
        <div id="timerBadge">⏳ נותר זמן: <span id="timerText">--:--</span></div>

        <div id="successModal" style="display:none;">
            <h1 style="font-size:3rem; color:#27ae60;">הגשת המבחן הצליחה! ✅</h1>
            <p style="font-size:1.2rem; margin:20px 0;">הקובץ נשמר במחשבך. העלה אותו לתיקיית ההגשה כעת.</p>
            <div id="submissionActions" style="display:flex; gap:15px; flex-direction:column; width:300px;"></div>
            <button onclick="enableGradingFromModal()" style="margin-top:50px; background:transparent; border:1px solid white; color:white; padding:10px 20px; border-radius:5px;">כניסת מורה לבדיקה 👨‍🏫</button>
        </div>
        
        <div class="container" id="mainContainer" style="filter:blur(10px); transition: filter 0.5s;">
            <div class="teacher-header" id="teacherHeader">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h2 style="margin:0; color:#856404;">👨‍🏫 מצב בדיקת מורה</h2>
                        <p style="margin:5px 0 0 0;">הזן ציונים והערות בכל שאלה. הציון הסופי יחושב אוטומטית.</p>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:0.9rem; margin-bottom:5px;">ציון סופי:</div>
                        <div class="final-score-badge" id="finalScoreDisplay">0</div>
                    </div>
                </div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button onclick="saveGradedExam()" style="background:#27ae60; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">💾 שמור מבחן בדוק (HTML)</button>
                    <button onclick="exportToDoc()" style="background:#2980b9; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">📄 הורד סיכום בודק (Word)</button>
                </div>
            </div>

            <div style="text-align:center;">${logoHTML}<h1>${examTitle}</h1></div>
            <div style="background:#f8f9fa; padding:20px; border-radius:10px; margin-bottom:30px; border-right:5px solid var(--accent);">
                <strong>שם התלמיד:</strong> ${studentName}
            </div>
            
            ${globalInstructionsHTML}
            <div class="tabs">${tabsHTML}</div>
            <form id="examForm">${sectionsHTML}</form>
            
            <div style="text-align:center; margin-top:100px; padding-top:50px; border-top:2px solid #eee;">
                <button type="button" onclick="submitExam()" style="background:var(--success); color:white; padding:20px 60px; font-size:1.5rem; border:none; border-radius:50px; box-shadow: 0 10px 20px rgba(39, 174, 96, 0.2);">הגש מבחן סופי 📤</button>
            </div>
        </div>

        <script>
        let totalTime=${duration}*60, timerInterval, markerColor=null;
        
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

        document.addEventListener('mouseup', (e) => {
            if (!markerColor || e.target.closest('textarea') || e.target.closest('input')) return;
            const sel = window.getSelection();
            if (sel.rangeCount > 0 && !sel.isCollapsed) {
                document.designMode = "on";
                if(markerColor === 'eraser') document.execCommand("hiliteColor", false, "transparent");
                else { document.execCommand("styleWithCSS", false, true); document.execCommand("hiliteColor", false, markerColor); }
                document.designMode = "off";
                sel.removeAllRanges();
            }
        });

        function startExamTimer(){
            document.documentElement.requestFullscreen().catch(() => {});
            document.getElementById('startScreen').style.display='none';
            document.getElementById('mainContainer').style.filter='none';
            document.getElementById('timerBadge').style.display='block';
            timerInterval = setInterval(() => {
                totalTime--;
                let m=Math.floor(totalTime/60), s=totalTime%60;
                document.getElementById('timerText').innerText = (m<10?'0'+m:m)+':'+(s<10?'0'+s:s);
                if(totalTime<=0) { clearInterval(timerInterval); submitExam(); }
            }, 1000);
        }

        function showPart(id){
            document.querySelectorAll('.exam-section').forEach(e=>e.classList.remove('active'));
            document.getElementById('part-'+id).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            event.target.classList.add('active');
        }

        function calcTotal(){
            let sum = 0;
            document.querySelectorAll('.grade-input').forEach(i => {
                if(i.value) sum += parseFloat(i.value);
            });
            document.getElementById('finalScoreDisplay').innerText = sum;
            document.getElementById('teacherCalculatedScore')?.innerText = sum; // Fallback
        }

        function submitExam(){
            clearInterval(timerInterval);
            if(document.fullscreenElement) document.exitFullscreen();
            
            // שמירת ערכי הטקסט בתוך ה-DOM לפני ייצוא
            document.querySelectorAll('input, textarea').forEach(e => {
                e.setAttribute('value', e.value);
                if(e.tagName === 'TEXTAREA') e.innerHTML = e.value;
            });

            const html = "<!DOCTYPE html>" + document.documentElement.outerHTML;
            const blob = new Blob([html], {type: 'text/html'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "${examTitle} - פתור - " + studentName + ".html";
            a.click();

            document.getElementById('successModal').style.display = 'flex';
            
            // פתיחה אוטומטית של דרייב אם קיים
            if("${driveLink}") {
                window.open("${driveLink}", "_blank");
                const actions = document.getElementById('submissionActions');
                actions.innerHTML += '<a href="${driveLink}" target="_blank" style="background:#f1c40f; color:black; padding:15px; text-decoration:none; border-radius:5px; font-weight:bold; text-align:center;">📂 פתח תיקיית הגשה בדרייב</a>';
            }
            if("${teacherEmail}") {
                const actions = document.getElementById('submissionActions');
                actions.innerHTML += '<a href="mailto:${teacherEmail}?subject=הגשת מבחן: ${examTitle}" style="background:#3498db; color:white; padding:15px; text-decoration:none; border-radius:5px; font-weight:bold; text-align:center;">📧 שלח במייל למורה</a>';
            }
        }

        function simpleHash(s){let h=0;for(let i=0;i<s.length;i++)h=(h<<5)-h+s.charCodeAt(i)|0;return h.toString();}

        function enableGradingFromModal() {
            if(simpleHash(prompt('הכנס קוד מורה לשחרור בדיקה:')) === "${unlockCodeHash}") {
                document.getElementById('successModal').style.display = 'none';
                enableGradingUI();
            } else { alert('קוד שגוי'); }
        }

        function enableGradingUI() {
            document.getElementById('teacherHeader').style.display = 'block';
            document.querySelectorAll('.grading-area').forEach(e => e.style.display = 'block');
            document.querySelectorAll('.model-answer-secret').forEach(e => e.style.display = 'block');
            document.querySelectorAll('.exam-section').forEach(e => e.style.display = 'block');
            document.querySelector('.tabs').style.display = 'none';
            document.body.style.background = "#fff9db";
            calcTotal();
        }

        function saveGradedExam() {
            document.querySelectorAll('input, textarea').forEach(e => {
                e.setAttribute('value', e.value);
                if(e.tagName === 'TEXTAREA') e.innerHTML = e.value;
            });
            const html = "<!DOCTYPE html>" + document.documentElement.outerHTML;
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([html], {type:'text/html'}));
            a.download = "${examTitle} - בדוק - " + studentName + ".html";
            a.click();
        }

        function exportToDoc() {
            const finalScore = document.getElementById('finalScoreDisplay').innerText;
            let content = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">';
            content += '<head><meta charset="utf-8"><style>body{font-family: Arial, sans-serif; direction: rtl;} .q-box{border: 1px solid #ccc; padding: 15px; margin-bottom: 20px;} .teacher-feedback{background: #e8f6f3; padding: 10px; border-right: 5px solid #27ae60;}</style></head><body>';
            content += '<h1 style="text-align:center;">סיכום בדיקת מבחן: ${examTitle}</h1>';
            content += '<h2>תלמיד: ' + studentName + '</h2>';
            content += '<h2 style="color:red;">ציון סופי: ' + finalScore + '</h2><hr>';

            document.querySelectorAll('.q-block, .sub-question-block').forEach((block, idx) => {
                const isSub = block.classList.contains('sub-question-block');
                const text = (block.querySelector('.q-content') || block.querySelector('.sub-q-text')).innerText;
                const studentAns = (block.querySelector('.student-ans'))?.value || '(אין תשובה)';
                const grade = (block.querySelector('.grade-input'))?.value || '0';
                const comment = (block.querySelector('.teacher-comment'))?.value || '';

                content += '<div class="q-box">';
                content += '<p><strong>שאלה/סעיף:</strong> ' + text + '</p>';
                content += '<p><strong>תשובת תלמיד:</strong> ' + studentAns + '</p>';
                content += '<div class="teacher-feedback">';
                content += '<p><strong>ציון:</strong> ' + grade + '</p>';
                if(comment) content += '<p><strong>הערה:</strong> ' + comment + '</p>';
                content += '</div></div>';
            });

            content += '</body></html>';
            const blob = new Blob(['\\ufeff', content], {type: 'application/msword'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "${examTitle} - סיכום בדיקה - " + studentName + ".doc";
            a.click();
        }
        <\/script></body></html>`;
    }
};
