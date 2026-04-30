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

const screens = {
  start: document.getElementById('startScreen'),
  character: document.getElementById('characterScreen'),
  game: document.getElementById('gameScreen'),
  result: document.getElementById('resultScreen')
};

const state = {
  selectedCharacter: characters[0],
  timeLeft: 45,
  score: 0,
  round: 1,
  timer: null,
  activeSequence: [],
  progress: [],
  hits: 0,
  misses: 0,
  maxCombo: 0,
  combo: 0,
  leaderboard: loadLeaderboard()
};

const el = {
  characterList: document.getElementById('characterList'),
  stageCharacter: document.getElementById('stageCharacter'),
  selectedName: document.getElementById('selectedName'),
  selectedLine: document.getElementById('selectedLine'),
  targetSequence: document.getElementById('targetSequence'),
  currentProgress: document.getElementById('currentProgress'),
  feedbackText: document.getElementById('feedbackText'),
  moveButtons: document.getElementById('moveButtons'),
  timeValue: document.getElementById('timeValue'),
  scoreValue: document.getElementById('scoreValue'),
  roundValue: document.getElementById('roundValue'),
  resultCharacter: document.getElementById('resultCharacter'),
  finalScore: document.getElementById('finalScore'),
  finalAccuracy: document.getElementById('finalAccuracy'),
  finalCombo: document.getElementById('finalCombo'),
  leaderboardList: document.getElementById('leaderboardList'),
  nicknameInput: document.getElementById('nicknameInput'),
  resultTitle: document.getElementById('resultTitle'),
  resultSubtitle: document.getElementById('resultSubtitle')
};

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function renderCharacters() {
  el.characterList.innerHTML = characters.map((character) => `
    <button class="character-option ${state.selectedCharacter.id === character.id ? 'active' : ''}" data-character="${character.id}">
      <div class="character-thumb" style="background:${character.bg}">${character.emoji}</div>
      <div class="character-meta">
        <strong>${character.name}</strong>
        <span>${character.vibe}</span>
      </div>
    </button>
  `).join('');

  document.querySelectorAll('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCharacter = characters.find((character) => character.id === button.dataset.character);
      renderCharacters();
    });
  });
}

function applyCharacter(element, character) {
  element.style.background = character.bg;
  element.textContent = character.emoji;
}

function randomSequence(length) {
  return Array.from({ length }, () => moves[Math.floor(Math.random() * moves.length)]);
}

function updateBoardHeader() {
  applyCharacter(el.stageCharacter, state.selectedCharacter);
  el.selectedName.textContent = state.selectedCharacter.name;
  el.selectedLine.textContent = state.selectedCharacter.line;
}

function renderSequence() {
  el.targetSequence.innerHTML = state.activeSequence.map((move, index) => {
    const className = index < state.progress.length ? 'done' : index === state.progress.length ? 'active' : '';
    return `<span class="sequence-chip ${className}">${move.icon} ${move.id}</span>`;
  }).join('');

  el.currentProgress.innerHTML = state.progress.length
    ? state.progress.map((move) => `<span class="sequence-chip done">${move.icon} ${move.id}</span>`).join('')
    : '<span class="sequence-chip">아직 입력 안 함</span>';
}

function renderMoveButtons() {
  el.moveButtons.innerHTML = moves.map((move) => `
    <button class="move-btn" data-move="${move.id}">${move.icon}<br>${move.id}</button>
  `).join('');

  document.querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('click', () => handleMove(button.dataset.move));
  });
}

function updateHud() {
  el.timeValue.textContent = state.timeLeft;
  el.scoreValue.textContent = state.score;
  el.roundValue.textContent = state.round;
}

function nextRound() {
  const length = Math.min(3 + state.round, 6);
  state.activeSequence = randomSequence(length);
  state.progress = [];
  renderSequence();
}

function startGame() {
  state.timeLeft = 45;
  state.score = 0;
  state.round = 1;
  state.hits = 0;
  state.misses = 0;
  state.combo = 0;
  state.maxCombo = 0;
  updateBoardHeader();
  updateHud();
  nextRound();
  el.feedbackText.textContent = 'START!';
  showScreen('game');

  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    updateHud();
    if (state.timeLeft <= 0) endGame();
  }, 1000);
}

function handleMove(moveId) {
  const expected = state.activeSequence[state.progress.length];
  if (!expected) return;

  if (moveId === expected.id) {
    state.progress.push(expected);
    state.hits += 1;
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.score += 120 + state.combo * 10;

    if (state.progress.length === state.activeSequence.length) {
      state.score += 180;
      state.round += 1;
      el.feedbackText.textContent = 'Perfect! 다음 스테이지 ✨';
      nextRound();
    } else {
      el.feedbackText.textContent = '좋아! 계속 눌러줘';
      renderSequence();
    }
  } else {
    state.misses += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - 50);
    state.progress = [];
    el.feedbackText.textContent = '앗! 처음부터 다시';
    renderSequence();
  }
  updateHud();
}

function endGame() {
  clearInterval(state.timer);
  const total = state.hits + state.misses;
  const accuracy = total ? Math.round((state.hits / total) * 100) : 100;
  applyCharacter(el.resultCharacter, state.selectedCharacter);
  el.finalScore.textContent = state.score;
  el.finalAccuracy.textContent = `${accuracy}%`;
  el.finalCombo.textContent = state.maxCombo;
  el.resultTitle.textContent = accuracy >= 85 ? '심쿵 성공!' : '다음엔 더 잘할 수 있어!';
  el.resultSubtitle.textContent = `${state.selectedCharacter.name}와 함께 ${state.round} 스테이지까지 갔어.`;
  el.nicknameInput.value = '';
  renderLeaderboard();
  showScreen('result');
}

function saveScore() {
  const nickname = el.nicknameInput.value.trim() || '익명댄서';
  const total = state.hits + state.misses;
  const accuracy = total ? Math.round((state.hits / total) * 100) : 100;
  state.leaderboard.push({ nickname, score: state.score, accuracy, character: state.selectedCharacter.name, round: state.round });
  state.leaderboard.sort((a, b) => b.score - a.score);
  state.leaderboard = state.leaderboard.slice(0, 8);
  localStorage.setItem('swing-dancing-game-leaderboard', JSON.stringify(state.leaderboard));
  renderLeaderboard();
}

function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('swing-dancing-game-leaderboard')) || [];
  } catch {
    return [];
  }
}

function renderLeaderboard() {
  if (!state.leaderboard.length) {
    el.leaderboardList.innerHTML = '<div class="leaderboard-item"><div><strong>아직 기록 없음</strong><span>첫 플레이어가 되어봐</span></div></div>';
    return;
  }
  el.leaderboardList.innerHTML = state.leaderboard.map((entry, index) => `
    <div class="leaderboard-item">
      <div>
        <strong>${index + 1}. ${entry.nickname}</strong>
        <span>${entry.character} · stage ${entry.round}</span>
      </div>
      <div>
        <strong>${entry.score}</strong>
        <span>${entry.accuracy}%</span>
      </div>
    </div>
  `).join('');
}

document.getElementById('startBtn').addEventListener('click', () => showScreen('character'));
document.getElementById('goStageBtn').addEventListener('click', startGame);
document.getElementById('retryBtn').addEventListener('click', startGame);
document.getElementById('saveBtn').addEventListener('click', saveScore);
document.getElementById('homeBtn').addEventListener('click', () => {
  clearInterval(state.timer);
  showScreen('start');
});

renderCharacters();
renderMoveButtons();
renderLeaderboard();
