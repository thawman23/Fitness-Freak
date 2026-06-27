// ===== WORKOUT TRACKER =====
let exercises = [];
let sessionStart = null;
let sessionInterval = null;
let timerInterval = null;
let timerDuration = 60;
let timerRemaining = 60;

// ===== ADD EXERCISE =====
function quickAdd(name) {
  document.getElementById('ex-name').value = name;
  document.getElementById('ex-sets').focus();
}

function addExercise() {
  const name = document.getElementById('ex-name').value.trim();
  const sets = parseInt(document.getElementById('ex-sets').value) || 3;
  const reps = parseInt(document.getElementById('ex-reps').value) || 10;
  const weight = parseFloat(document.getElementById('ex-weight').value) || 0;

  if (!name) { alert('Enter an exercise name!'); return; }

  // Start session on first exercise
  if (exercises.length === 0) {
    sessionStart = Date.now();
    document.getElementById('session-section').style.display = 'block';
    document.getElementById('finish-btn').style.display = 'block';
    sessionInterval = setInterval(updateSessionClock, 1000);
  }

  const ex = {
    id: Date.now(),
    name, sets, reps, weight,
    completedSets: new Array(sets).fill(false)
  };
  exercises.push(ex);
  renderExercises();

  // Clear inputs
  document.getElementById('ex-name').value = '';
  document.getElementById('ex-sets').value = '';
  document.getElementById('ex-reps').value = '';
  document.getElementById('ex-weight').value = '';
  document.getElementById('ex-name').focus();
}

// ===== RENDER =====
function renderExercises() {
  const el = document.getElementById('exercise-list');
  el.innerHTML = '';
  exercises.forEach((ex, i) => {
    const completedCount = ex.completedSets.filter(Boolean).length;
    const allDone = completedCount === ex.sets;
    let setsHTML = '';
    for (let s = 0; s < ex.sets; s++) {
      const doneClass = ex.completedSets[s] ? 'done' : '';
      setsHTML += `<button class="set-btn ${doneClass}" onclick="completeSet(${i},${s})">
        Set ${s + 1}${ex.completedSets[s] ? ' ✓' : ''}</button>`;
    }
    el.innerHTML += `
      <div class="ex-card" style="${allDone ? 'border-color:rgba(74,222,128,.2);opacity:.7' : ''}">
        <div class="ex-card-header">
          <div>
            <div class="ex-name">${ex.name} ${allDone ? '✅' : ''}</div>
            <div class="ex-meta">${ex.sets} sets × ${ex.reps} reps${ex.weight ? ' @ ' + ex.weight + 'kg' : ''} — ${completedCount}/${ex.sets} done</div>
          </div>
          <button class="ex-delete" onclick="deleteExercise(${i})">🗑️</button>
        </div>
        <div class="sets-grid">${setsHTML}</div>
      </div>`;
  });
}

// ===== COMPLETE SET =====
function completeSet(exIdx, setIdx) {
  if (exercises[exIdx].completedSets[setIdx]) return; // already done
  exercises[exIdx].completedSets[setIdx] = true;
  renderExercises();
  // Show rest timer
  showTimer();
}

// ===== DELETE EXERCISE =====
function deleteExercise(idx) {
  exercises.splice(idx, 1);
  renderExercises();
  if (exercises.length === 0) {
    document.getElementById('session-section').style.display = 'none';
    document.getElementById('finish-btn').style.display = 'none';
    clearInterval(sessionInterval);
    sessionStart = null;
  }
}

// ===== SESSION CLOCK =====
function updateSessionClock() {
  if (!sessionStart) return;
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  document.getElementById('session-clock').textContent = m + ':' + s;
}

// ===== REST TIMER =====
function showTimer() {
  timerRemaining = timerDuration;
  updateTimerDisplay();
  resetTimerRing();
  document.getElementById('timer-overlay').classList.add('show');
  document.getElementById('btn-timer-start').textContent = '▶ Start';
  clearInterval(timerInterval);

  // Auto-start after 500ms
  setTimeout(() => startTimer(), 500);
}

function setTimer(sec) {
  timerDuration = sec;
  timerRemaining = sec;
  updateTimerDisplay();
  resetTimerRing();
  clearInterval(timerInterval);
  document.getElementById('btn-timer-start').textContent = '▶ Start';
  // Update active preset
  document.querySelectorAll('.preset').forEach(p => p.classList.remove('active-preset'));
  event.target.classList.add('active-preset');
}

function startTimer() {
  clearInterval(timerInterval);
  const btn = document.getElementById('btn-timer-start');
  btn.textContent = '⏸ Pause';

  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();
    updateTimerRing();

    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      // Vibrate if available
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      // Play a beep sound
      playBeep();
      // Auto-close after 1s
      setTimeout(() => skipTimer(), 1000);
    }
  }, 1000);

  btn.onclick = () => {
    clearInterval(timerInterval);
    btn.textContent = '▶ Start';
    btn.onclick = () => startTimer();
  };
}

function skipTimer() {
  clearInterval(timerInterval);
  document.getElementById('timer-overlay').classList.remove('show');
}

function updateTimerDisplay() {
  const m = Math.floor(timerRemaining / 60);
  const s = timerRemaining % 60;
  document.getElementById('timer-display').textContent =
    m > 0 ? `${m}:${String(s).padStart(2, '0')}` : s;
}

function updateTimerRing() {
  const circ = 2 * Math.PI * 88; // ~553
  const pct = timerRemaining / timerDuration;
  document.getElementById('timer-ring-fill').style.strokeDashoffset = circ * (1 - pct);
  // Color shift: green → yellow → red
  const fill = document.getElementById('timer-ring-fill');
  if (pct > 0.5) fill.style.stroke = '#4ade80';
  else if (pct > 0.2) fill.style.stroke = '#f59e0b';
  else fill.style.stroke = '#ef4444';
}

function resetTimerRing() {
  document.getElementById('timer-ring-fill').style.strokeDashoffset = 0;
  document.getElementById('timer-ring-fill').style.stroke = '#4ade80';
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start(); osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

// ===== FINISH SESSION =====
function finishSession() {
  if (exercises.length === 0) return;

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const totalSets = exercises.reduce((a, e) => a + e.completedSets.filter(Boolean).length, 0);
  const totalVol = exercises.reduce((a, e) => {
    const done = e.completedSets.filter(Boolean).length;
    return a + (done * e.reps * (e.weight || 0));
  }, 0);

  const session = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
    exercises: exercises.map(e => ({
      name: e.name,
      sets: e.completedSets.filter(Boolean).length + '/' + e.sets,
      reps: e.reps,
      weight: e.weight
    })),
    totalSets,
    totalVolume: Math.round(totalVol)
  };

  // Save to history
  const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  history.unshift(session);
  if (history.length > 30) history.pop();
  localStorage.setItem('workoutHistory', JSON.stringify(history));

  // Reset
  exercises = [];
  clearInterval(sessionInterval);
  sessionStart = null;
  document.getElementById('exercise-list').innerHTML = '';
  document.getElementById('session-section').style.display = 'none';
  document.getElementById('finish-btn').style.display = 'none';
  document.getElementById('session-clock').textContent = '00:00';

  renderHistory();
  alert(`💪 Session Complete!\n\nDuration: ${session.duration}\nSets: ${totalSets}\nVolume: ${session.totalVolume} kg`);
}

// ===== HISTORY =====
function renderHistory() {
  const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  const el = document.getElementById('history-list');
  if (history.length === 0) {
    el.innerHTML = '<p class="no-history">No past sessions yet. Start logging your workouts!</p>';
    return;
  }
  el.innerHTML = '';
  history.forEach(s => {
    const exList = s.exercises.map(e =>
      `${e.name} (${e.sets} sets × ${e.reps} reps${e.weight ? ' @ ' + e.weight + 'kg' : ''})`
    ).join(' • ');
    el.innerHTML += `
      <div class="hist-card">
        <div class="hist-date">${s.date} — ${s.time}</div>
        <div class="hist-summary">⏱ ${s.duration} • ${s.totalSets} sets • ${s.totalVolume} kg volume</div>
        <div class="hist-exercises">${exList}</div>
      </div>`;
  });
}
renderHistory();
