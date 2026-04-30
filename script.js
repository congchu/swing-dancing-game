const characters = [
  { id: 'cherry', name: '체리', emoji: '🍒', vibe: '러블리 리드 타입', line: '오늘은 내가 먼저 턴할래!', bg: 'linear-gradient(180deg,#ffd5e6,#ff8cb5)' },
  { id: 'moka', name: '모카', emoji: '☕', vibe: '클래식 스윙 타입', line: '천천히, 그리고 정확하게.', bg: 'linear-gradient(180deg,#f4dfc6,#b98b73)' },
  { id: 'cookie', name: '쿠키', emoji: '🍪', vibe: '발랄 리듬 타입', line: '리듬만 타면 다 괜찮아!', bg: 'linear-gradient(180deg,#fff5b5,#9ff5d0)' },
  { id: 'ruby', name: '루비', emoji: '💃', vibe: '화려한 무대 타입', line: '스포트라이트는 내가 받을게.', bg: 'linear-gradient(180deg,#ffd4de,#c7578c)' }
];

const moves = [
  { id: 'STEP', icon: '👣' },
  { id: 'TURN', icon: '🌀' },
  { id: 'KICK', icon: '✨' },
  { id: 'SLIDE', icon: '💨' },
  { id: 'POSE', icon: '💗' },
  { id: 'SWAY', icon: '🎵' }
];

const KEY = 'swing-dancing-game-state';
const LB_KEY = 'swing-dancing-game-leaderboard';

function saveState(partial) {
  const current = loadState();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...partial }));
}
function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function clearState() { localStorage.removeItem(KEY); }
function loadLeaderboard() {
  try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; } catch { return []; }
}
function saveLeaderboard(items) { localStorage.setItem(LB_KEY, JSON.stringify(items)); }
function qs(id) { return document.getElementById(id); }
function randomSequence(length) { return Array.from({ length }, () => moves[Math.floor(Math.random() * moves.length)]); }
function applyCharacter(el, character) { if (!el || !character) return; el.style.background = character.bg; el.textContent = character.emoji; }

function renderCharacterList(container, selectedId) {
  container.innerHTML = characters.map((character) => `
    <button class="character-option ${selectedId === character.id ? 'active' : ''}" data-character="${character.id}">
      <div class="character-thumb" style="background:${character.bg}">${character.emoji}</div>
      <div class="character-meta">
        <strong>${character.name}</strong>
        <span>${character.vibe}</span>
      </div>
    </button>
  `).join('');
}

function pageStart() {
  qs('startBtn')?.addEventListener('click', () => {
    saveState({ characterId: 'cherry' });
    location.href = 'character.html';
  });
  qs('homeBtn')?.addEventListener('click', () => { clearState(); location.href = 'index.html'; });
}

function pageCharacter() {
  const container = qs('characterList');
  let selectedId = loadState().characterId || 'cherry';
  renderCharacterList(container, selectedId);

  container.querySelectorAll('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedId = button.dataset.character;
      saveState({ characterId: selectedId });
      renderCharacterList(container, selectedId);
      pageCharacter();
    });
  });

  qs('goStageBtn')?.addEventListener('click', () => {
    saveState({
      characterId: selectedId,
      timeLeft: 45,
      score: 0,
      round: 1,
      hits: 0,
      misses: 0,
      combo: 0,
      maxCombo: 0,
      activeSequence: randomSequence(4),
      progress: []
    });
    location.href = 'play.html';
  });
  qs('homeBtn')?.addEventListener('click', () => { clearState(); location.href = 'index.html'; });
}

function pagePlay() {
  const state = loadState();
  const character = characters.find((item) => item.id === state.characterId) || characters[0];
  if (!state.activeSequence) {
    location.href = 'character.html';
    return;
  }

  let runtime = {
    ...state,
    character,
    activeSequence: state.activeSequence,
    progress: state.progress || []
  };

  applyCharacter(qs('stageCharacter'), character);
  qs('selectedName').textContent = character.name;
  qs('selectedLine').textContent = character.line;

  function renderHud() {
    qs('timeValue').textContent = runtime.timeLeft;
    qs('scoreValue').textContent = runtime.score;
    qs('roundValue').textContent = runtime.round;
  }

  function renderSequence() {
    qs('targetSequence').innerHTML = runtime.activeSequence.map((move, index) => {
      const className = index < runtime.progress.length ? 'done' : index === runtime.progress.length ? 'active' : '';
      return `<span class="sequence-chip ${className}">${move.icon} ${move.id}</span>`;
    }).join('');

    qs('currentProgress').innerHTML = runtime.progress.length
      ? runtime.progress.map((move) => `<span class="sequence-chip done">${move.icon} ${move.id}</span>`).join('')
      : '<span class="sequence-chip">아직 입력 안 함</span>';
  }

  function persist() {
    saveState({
      ...runtime,
      characterId: runtime.character.id
    });
  }

  function nextRound() {
    runtime.round += 1;
    runtime.activeSequence = randomSequence(Math.min(3 + runtime.round, 6));
    runtime.progress = [];
    qs('feedbackText').textContent = 'Perfect! 다음 스테이지 ✨';
    renderHud();
    renderSequence();
    persist();
  }

  function finishGame() {
    clearInterval(timer);
    persist();
    location.href = 'result.html';
  }

  qs('moveButtons').innerHTML = moves.map((move) => `
    <button class="move-btn" data-move="${move.id}">${move.icon}<br>${move.id}</button>
  `).join('');

  qs('moveButtons').querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('click', () => {
      const expected = runtime.activeSequence[runtime.progress.length];
      if (!expected) return;
      if (button.dataset.move === expected.id) {
        runtime.progress.push(expected);
        runtime.hits += 1;
        runtime.combo += 1;
        runtime.maxCombo = Math.max(runtime.maxCombo, runtime.combo);
        runtime.score += 120 + runtime.combo * 10;
        if (runtime.progress.length === runtime.activeSequence.length) {
          runtime.score += 180;
          nextRound();
        } else {
          qs('feedbackText').textContent = '좋아! 계속 눌러줘';
          renderSequence();
          renderHud();
          persist();
        }
      } else {
        runtime.misses += 1;
        runtime.combo = 0;
        runtime.score = Math.max(0, runtime.score - 50);
        runtime.progress = [];
        qs('feedbackText').textContent = '앗! 처음부터 다시';
        renderSequence();
        renderHud();
        persist();
      }
    });
  });

  renderHud();
  renderSequence();
  persist();
  const timer = setInterval(() => {
    runtime.timeLeft -= 1;
    renderHud();
    persist();
    if (runtime.timeLeft <= 0) finishGame();
  }, 1000);

  qs('homeBtn')?.addEventListener('click', () => { clearInterval(timer); clearState(); location.href = 'index.html'; });
}

function pageResult() {
  const state = loadState();
  const leaderboard = loadLeaderboard();
  const character = characters.find((item) => item.id === state.characterId) || characters[0];
  applyCharacter(qs('resultCharacter'), character);

  const total = (state.hits || 0) + (state.misses || 0);
  const accuracy = total ? Math.round(((state.hits || 0) / total) * 100) : 100;
  qs('finalScore').textContent = state.score || 0;
  qs('finalAccuracy').textContent = `${accuracy}%`;
  qs('finalCombo').textContent = state.maxCombo || 0;
  qs('resultTitle').textContent = accuracy >= 85 ? '심쿵 성공!' : '다음엔 더 잘할 수 있어!';
  qs('resultSubtitle').textContent = `${character.name}와 함께 ${state.round || 1} 스테이지까지 갔어.`;

  function renderLeaderboard(items) {
    qs('leaderboardList').innerHTML = items.length
      ? items.map((entry, index) => `
          <div class="leaderboard-item">
            <div>
              <strong>${index + 1}. ${entry.nickname}</strong>
              <span>${entry.character} · stage ${entry.round}</span>
            </div>
            <div>
              <strong>${entry.score}</strong>
              <span>${entry.accuracy}%</span>
            </div>
          </div>`).join('')
      : '<div class="leaderboard-item"><div><strong>아직 기록 없음</strong><span>첫 플레이어가 되어봐</span></div></div>';
  }
  renderLeaderboard(leaderboard);

  qs('saveBtn')?.addEventListener('click', () => {
    const nickname = qs('nicknameInput').value.trim() || '익명댄서';
    leaderboard.push({ nickname, score: state.score || 0, accuracy, character: character.name, round: state.round || 1 });
    leaderboard.sort((a, b) => b.score - a.score);
    const sliced = leaderboard.slice(0, 8);
    saveLeaderboard(sliced);
    renderLeaderboard(sliced);
  });

  qs('retryBtn')?.addEventListener('click', () => {
    saveState({ characterId: character.id });
    location.href = 'character.html';
  });
  qs('homeBtn')?.addEventListener('click', () => { clearState(); location.href = 'index.html'; });
}

const page = document.body.dataset.page;
if (page === 'start') pageStart();
if (page === 'character') pageCharacter();
if (page === 'play') pagePlay();
if (page === 'result') pageResult();
