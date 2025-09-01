const guards = [
  { id: 1, name: "דן לוי", role: "מפקד משמרת", department: "אבטחה" },
  { id: 2, name: "נועה כהן", role: "סייר", department: "אבטחה" },
  { id: 3, name: "אילן פרץ", role: "רכז משמרות", department: "מינהלה" },
  { id: 4, name: "מאיה ישראלי", role: "סייר", department: "אבטחה" },
  { id: 5, name: "רועי חן", role: "בקר כניסה", department: "תפעול" },
  { id: 6, name: "הילה שמש", role: "בקר כניסה", department: "תפעול" },
];

const state = {
  filters: { role: "", department: "" },
  roster: [] // {guardId, date, shift}
};

const roles = [...new Set(guards.map(g => g.role))];
const departments = [...new Set(guards.map(g => g.department))];

function saveState() { localStorage.setItem('guard_roster_state', JSON.stringify(state)); }
function loadState() {
  const raw = localStorage.getItem('guard_roster_state');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.filters) state.filters = parsed.filters;
    if (Array.isArray(parsed.roster)) state.roster = parsed.roster;
  } catch {}
}

function filterGuards() {
  return guards.filter(g => {
    const roleOk = !state.filters.role || g.role === state.filters.role;
    const deptOk = !state.filters.department || g.department === state.filters.department;
    return roleOk && deptOk;
  });
}

function addToRoster(guardId, dateStr, shift) {
  if (!guardId || !dateStr || !shift) return;
  const exists = state.roster.some(r => r.guardId === guardId && r.date === dateStr && r.shift === shift);
  if (exists) return;
  state.roster.push({ guardId, date: dateStr, shift });
  saveState();
  render();
}

function removeFromRoster(index) {
  state.roster.splice(index, 1);
  saveState();
  render();
}

function guardById(id) { return guards.find(g => g.id === id); }

function exportRoster() {
  const dataStr = JSON.stringify(state.roster, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'roster.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importRoster(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        state.roster = data.filter(r => r && r.guardId && r.date && r.shift);
        saveState();
        render();
      }
    } catch (e) {
      alert('קובץ לא תקין');
    }
  };
  reader.readAsText(file);
}

function clearRoster() {
  if (!confirm('לנקות את הרשימה?')) return;
  state.roster = [];
  saveState();
  render();
}

function renderFilters() {
  const roleOptions = ['<option value="">כל התפקידים</option>', ...roles.map(r => `<option value="${r}" ${state.filters.role===r?'selected':''}>${r}</option>` )];
  const depOptions = ['<option value="">כל המחלקות</option>', ...departments.map(d => `<option value="${d}" ${state.filters.department===d?'selected':''}>${d}</option>` )];
  return `<div class="panel">
    <div class="toolbar">
      <label>תפקיד</label>
      <select id="filter-role">${roleOptions.join('')}</select>
      <label>מחלקה</label>
      <select id="filter-dep">${depOptions.join('')}</select>
      <span class="spacer"></span>
      <button id="btn-export">ייצוא</button>
      <label for="file-import" class="button-like"></label>
      <input type="file" id="file-import" accept="application/json">
    </div>
  </div>`;
}

function renderGuardsList() {
  const list = filterGuards();
  if (!list.length) return `<div class="empty">אין שומרים מתאימים למסננים</div>`;
  return `<div class="list">${list.map(g => `
    <div class="list-item">
      <div>
        <div><strong>${g.name}</strong></div>
        <div class="meta">
          <span class="chips">
            <span class="chip">${g.role}</span>
            <span class="chip">${g.department}</span>
          </span>
        </div>
      </div>
      <input type="date" id="d-${g.id}">
      <select id="s-${g.id}">
        <option value="בוקר">בוקר</option>
        <option value="צהריים">צהריים</option>
        <option value="לילה">לילה</option>
      </select>
      <button class="primary" data-guard="${g.id}">הוסף</button>
    </div>
  `).join('')}</div>`;
}

function renderRoster() {
  if (!state.roster.length) return `<div class="empty">אין שיבוצים</div>`;
  const sorted = [...state.roster].sort((a,b)=> a.date.localeCompare(b.date) || a.shift.localeCompare(b.shift));
  return `<table class="roster-table">
    <thead><tr><th>תאריך</th><th>משמרת</th><th>שם</th><th>תפקיד</th><th>מחלקה</th><th></th></tr></thead>
    <tbody>${sorted.map((r,idx)=>{
      const g = guardById(r.guardId) || {name:'?',role:'?',department:'?'};
      return `<tr>
        <td>${r.date}</td><td>${r.shift}</td>
        <td>${g.name}</td><td>${g.role}</td><td>${g.department}</td>
        <td><button data-remove="${idx}">הסר</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="grid grid-2">
      <div>
        <h2 class="section-title">שומרים</h2>
        ${renderFilters()}
        <div class="panel" style="margin-top:12px">${renderGuardsList()}</div>
      </div>
      <div>
        <h2 class="section-title">שיבוצים</h2>
        <div class="toolbar">
          <button class="success" id="btn-clear">נקה רשימה</button>
        </div>
        <div class="panel">${renderRoster()}</div>
      </div>
    </section>
  `;

  document.getElementById('filter-role').onchange = (e)=>{ state.filters.role = e.target.value; saveState(); render(); };
  document.getElementById('filter-dep').onchange = (e)=>{ state.filters.department = e.target.value; saveState(); render(); };
  document.getElementById('btn-export').onclick = exportRoster;
  document.getElementById('file-import').onchange = (e)=>{ if (e.target.files[0]) importRoster(e.target.files[0]); e.target.value=''; };
  const addButtons = app.querySelectorAll('button.primary[data-guard]');
  addButtons.forEach(btn=>{
    btn.onclick = ()=>{
      const guardId = Number(btn.dataset.guard);
      const date = document.getElementById(`d-${guardId}`).value;
      const shift = document.getElementById(`s-${guardId}`).value;
      addToRoster(guardId, date, shift);
    };
  });
  const removeButtons = app.querySelectorAll('button[data-remove]');
  removeButtons.forEach(btn=>{ btn.onclick = ()=> removeFromRoster(Number(btn.dataset.remove)); });
  document.getElementById('btn-clear').onclick = clearRoster;
}

loadState();
render();
