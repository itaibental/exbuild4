
let archiveList = [];
function initArchive() {
    const localData = localStorage.getItem('examArchive_v1');
    if (localData) archiveList = JSON.parse(localData);
    else if (typeof examsDB !== 'undefined') archiveList = examsDB;
    renderArchive();
}
function renderArchive() {
    const grid = document.getElementById('examGrid');
    const term = document.getElementById('searchBox').value.toLowerCase();
    grid.innerHTML = '';
    
    archiveList.filter(e => e.name.toLowerCase().includes(term) || e.year.toString().includes(term))
               .forEach(exam => {
        const card = document.createElement('div');
        card.style.cssText = "padding:5%; background:white; border-radius:12px; text-align:center; box-shadow:0 4px 6px rgba(0,0,0,0.05); cursor:pointer; transition:transform 0.2s;";
        card.innerHTML = `<div style="color:#3b82f6;font-weight:bold;">${exam.year}</div><div style="font-size:3rem;margin:10px 0;">📄</div><strong>${exam.name}</strong>`;
        card.onmouseover = () => card.style.transform = "translateY(-5px)";
        card.onmouseout = () => card.style.transform = "translateY(0)";
        card.onclick = () => alert('במערכת אמיתית זה יפתח את הקובץ: ' + exam.fileName);
        grid.appendChild(card);
    });
}
window.onload = initArchive;
