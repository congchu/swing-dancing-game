const characters = [
  {
    id: 'cherry',
    name: '체리',
    emoji: '🍒',
    vibe: '사랑스럽고 적극적인 타입',
    line: '오늘은 내가 먼저 춤추자!',
    bg: 'linear-gradient(135deg, #ff8fb7, #ff5f8f)'
  },
  {
    id: 'moka',
    name: '모카',
    emoji: '☕',
    vibe: '차분하고 클래식한 타입',
    line: '천천히 맞춰가면 더 멋져.',
    bg: 'linear-gradient(135deg, #d2b48c, #6f4e37)'
  },
  {
    id: 'cookie',
    name: '쿠키',
    emoji: '🍪',
    vibe: '장난꾸러기 발랄 타입',
    line: '헷갈리면 웃으면서 넘어가자!',
    bg: 'linear-gradient(135deg, #ffe082, #8ef7d5)'
  },
  {
    id: 'ruby',
    name: '루비',
    emoji: '💃',
    vibe: '화려하고 자신감 넘치는 타입',
    line: '제대로 보여줄게.',
    bg: 'linear-gradient(135deg, #6b0f1a, #b91372)'
  }
];

const outfits = [
  { id: 'red-dress', name: '레드 원피스', tag: 'Romantic', desc: '파티 플로어 무드', color: 'linear-gradient(135deg,#ff7aa2,#ff3f73)' },
  { id: 'vintage', name: '빈티지 셔츠룩', tag: 'Classic', desc: '재즈 바 무드', color: 'linear-gradient(135deg,#d8c3a5,#8d6e63)' },
  { id: 'mint-pop', name: '민트 팝룩', tag: 'Playful', desc: '브런치 댄스 무드', color: 'linear-gradient(135deg,#91f7e8,#5bc0be)' },
  { id: 'night-glam', name: '나이트 글램', tag: 'Bold', desc: '야간 루프탑 무드', color: 'linear-gradient(135deg,#4b164c,#dd3e54)' },
  { id: 'cream-cardigan', name: '크림 가디건', tag: 'Soft', desc: '산책 데이트 무드', color: 'linear-gradient(135deg,#fff3d6,#f6bd60)' },
  { id: 'navy-swing', name: '네이비 스윙셋', tag: 'Cool', desc: '리더 감성 무드', color: 'linear-gradient(135deg,#2c3e50,#4ca1af)' }
];

const moveMeta = {
  STEP: '👣',
  TURN: '🌀',
  KICK: '✨',
  SLIDE: '💨',
  POSE: '🕺'
};
const moves = Object.keys(moveMeta);

const screens = {
  start: document.getElementById('startScreen'),
  character: document.getElementById('characterScreen'),
  outfit: document.getElementById('outfitScreen'),
  game: document.getElementById('gameScreen'),
  leaderboard: document.getElementById('leaderboardScreen')
};

const state = {
  selectedCharacter: characters[0],
  selectedOutfit: outfits[0],
  timer: null,
  timeLeft: 60,
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  misses: 0,
  sequence: [],
  progress: [],
  roundActive: false,
  leaderboard: loadLeaderboard()
};

const el = {
  characterGrid: document.getElementById('characterGrid'),
  outfitGrid: document.getElementById('outfitGrid'),
  avatarPreview: document.getElementById('avatarPreview'),
  previewName: document.getElementById('previewName'),
  previewLine: document.getElementById('previewLine'),
  previewOutfitTag: document.getElementById('previewOutfitTag'),
  gameAvatar: document.getElementById('gameAvatar'),
  gameCharacterName: document.getElementById('gameCharacterName'),
  gameOutfitName: document.getElementById('gameOutfitName'),
  targetSequence: document.getElementById('targetSequence'),
  currentProgress: document.getElementById('currentProgress'),
  moveButtons: document.getElementById('moveButtons'),
  feedbackBox: document.getElementById('feedbackBox'),
  timeValue: document.getElementById('timeValue'),
  scoreValue: document.getElementById('scoreValue'),
  comboValue: document.getElementById('comboValue'),
  accuracyValue: document.getElementById('accuracyValue'),
  leaderboardList: document.getElementById('leaderboardList'),
  resultModal: document.getElementById('resultModal'),
  finalScore: document.getElementById('finalScore'),
  finalAccuracy: document.getElementById('finalAccuracy'),
  finalCombo: document.getElementById('finalCombo'),
  nicknameInput: document.getElementById('nicknameInput'),
  toOutfitBtn: document.getElementById('toOutfitBtn')
};

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function renderCharacters() {
  el.characterGrid.innerHTML = characters.map((character) => `
    <button class="character-card ${state.selectedCharacter.id === character.id ? 'selected' : ''}" data-character="${character.id}">
      <div class="character-avatar" style="--character-bg:${character.bg}"><span class="emoji">${character.emoji}</span></div>
      <h3>${character.name}</h3>
      <p>${character.vibe}</p>
      <small>${character.line}</small>
    </button>
  `).join('');

  document.querySelectorAll('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCharacter = characters.find((item) => item.id === button.dataset.character);
      el.toOutfitBtn.disabled = false;
      renderCharacters();
      updatePreview();
    });
  });
}

function renderOutfits() {
  el.outfitGrid.innerHTML = outfits.map((outfit) => `
    <button class="outfit-card ${state.selectedOutfit.id === outfit.id ? 'selected' : ''}" data-outfit="${outfit.id}">
      <strong>${outfit.name}</strong>
      <p>${outfit.desc}</p>
      <span class="chip soft">${outfit.tag}</span>
    </button>
  `).join('');

  document.querySelectorAll('[data-outfit]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedOutfit = outfits.find((item) => item.id === button.dataset.outfit);
      renderOutfits();
      updatePreview();
    });
  });
}

function applyAvatar(element, character, outfit, size = 'normal') {
  element.style.setProperty('--character-bg', outfit?.color || character.bg);
  element.innerHTML = `<span class="emoji">${character.emoji}</span>`;
  if (size === 'large') element.classList.add('large');
}

function updatePreview() {
  applyAvatar(el.avatarPreview, state.selectedCharacter, state.selectedOutfit);
  el.previewName.textContent = state.selectedCharacter.name;
  el.previewLine.textContent = state.selectedCharacter.line;
  el.previewOutfitTag.textContent = `${state.selectedOutfit.name} • ${state.selectedOutfit.tag}`;
}

function updateGameAvatar() {
  applyAvatar(el.gameAvatar, state.selectedCharacter, state.selectedOutfit, 'large');
  el.gameCharacterName.textContent = state.selectedCharacter.name;
  el.gameOutfitName.textContent = `${state.selectedOutfit.name} · ${state.selectedOutfit.desc}`;
}

function createSequence(length = 4) {
  return Array.from({ length }, () => moves[Math.floor(Math.random() * moves.length)]);
}

function renderSequence() {
  el.targetSequence.innerHTML = state.sequence.map((move, index) => {
    const className = index < state.progress.length ? 'done' : index === state.progress.length ? 'active' : '';
    return `<span class="sequence-chip ${className}">${moveMeta[move]} ${move}</span>`;
  }).join('');

  el.currentProgress.innerHTML = state.progress.length
    ? state.progress.map((move) => `<span class="sequence-chip done">${moveMeta[move]} ${move}</span>`).join('')
    : '<span class="sequence-chip">입력 대기</span>';
}

function renderMoveButtons() {
  el.moveButtons.innerHTML = moves.map((move) => `
    <button class="move-btn" data-move="${move}">${moveMeta[move]}<br/>${move}</button>
  `).join('');

  document.querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('click', () => handleMove(button.dataset.move));
  });
}

function setFeedback(text, kind = 'normal') {
  el.feedbackBox.textContent = text;
  const colors = {
    normal: '#fff7fc',
    good: '#5df2a9',
    bad: '#ff7676',
    hype: '#ffd166'
  };
  el.feedbackBox.style.color = colors[kind] || colors.normal;
}

function updateHud() {
  const total = state.hits + state.misses;
  const accuracy = total ? Math.round((state.hits / total) * 100) : 100;
  el.timeValue.textContent = state.timeLeft;
  el.scoreValue.textContent = state.score;
  el.comboValue.textContent = state.combo;
  el.accuracyValue.textContent = `${accuracy}%`;
}

function nextSequence() {
  state.sequence = createSequence(4 + Math.min(3, Math.floor(state.score / 1500)));
  state.progress = [];
  renderSequence();
}

function startGame() {
  state.timeLeft = 60;
  state.score = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.hits = 0;
  state.misses = 0;
  state.roundActive = true;
  updateGameAvatar();
  updateHud();
  nextSequence();
  setFeedback('Dance Start!', 'hype');
  showScreen('game');

  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    updateHud();
    if (state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function handleMove(move) {
  if (!state.roundActive) return;

  const expectedMove = state.sequence[state.progress.length];
  if (move === expectedMove) {
    state.progress.push(move);
    state.hits += 1;
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    const speedBonus = 20 + Math.max(0, state.timeLeft - 20);
    state.score += 100 + speedBonus + state.combo * 5;
    setFeedback(state.progress.length === state.sequence.length ? 'Perfect Combo!' : 'Nice step!', state.progress.length === state.sequence.length ? 'hype' : 'good');

    if (state.progress.length === state.sequence.length) {
      state.score += 150;
      nextSequence();
    } else {
      renderSequence();
    }
  } else {
    state.misses += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - 50);
    state.progress = [];
    setFeedback('Oops! 다시 맞춰봐', 'bad');
    renderSequence();
  }
  updateHud();
}

function endGame() {
  state.roundActive = false;
  clearInterval(state.timer);
  updateHud();
  const total = state.hits + state.misses;
  const accuracy = total ? Math.round((state.hits / total) * 100) : 100;
  el.finalScore.textContent = state.score;
  el.finalAccuracy.textContent = `${accuracy}%`;
  el.finalCombo.textContent = state.maxCombo;
  el.nicknameInput.value = '';
  el.resultModal.classList.remove('hidden');
}

function saveScore() {
  const total = state.hits + state.misses;
  const accuracy = total ? Math.round((state.hits / total) * 100) : 100;
  const nickname = el.nicknameInput.value.trim() || '익명댄서';
  const record = {
    nickname,
    score: state.score,
    accuracy,
    combo: state.maxCombo,
    character: state.selectedCharacter.name,
    outfit: state.selectedOutfit.name,
    createdAt: new Date().toISOString()
  };
  state.leaderboard.push(record);
  state.leaderboard.sort((a, b) => b.score - a.score);
  state.leaderboard = state.leaderboard.slice(0, 10);
  localStorage.setItem('swing-dancing-game-leaderboard', JSON.stringify(state.leaderboard));
  renderLeaderboard();
  el.resultModal.classList.add('hidden');
  showScreen('leaderboard');
}

function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('swing-dancing-game-leaderboard')) || [];
  } catch (error) {
    return [];
  }
}

function renderLeaderboard() {
  if (!state.leaderboard.length) {
    el.leaderboardList.innerHTML = '<div class="leaderboard-item"><span>아직 랭킹이 없어. 첫 플레이어가 되어봐!</span></div>';
    return;
  }

  el.leaderboardList.innerHTML = state.leaderboard.map((entry, index) => `
    <div class="leaderboard-item">
      <div>
        <strong>${index + 1}. ${entry.nickname}</strong>
        <p>${entry.character} · ${entry.outfit}</p>
      </div>
      <div style="text-align:right">
        <strong>${entry.score}</strong>
        <p>${entry.accuracy}% · combo ${entry.combo}</p>
      </div>
    </div>
  `).join('');
}

function resetAll() {
  clearInterval(state.timer);
  state.roundActive = false;
  el.resultModal.classList.add('hidden');
  showScreen('start');
}

document.getElementById('startBtn').addEventListener('click', () => showScreen('character'));
document.getElementById('toOutfitBtn').addEventListener('click', () => showScreen('outfit'));
document.getElementById('backToCharacterBtn').addEventListener('click', () => showScreen('character'));
document.getElementById('toGameBtn').addEventListener('click', startGame);
document.getElementById('saveScoreBtn').addEventListener('click', saveScore);
document.getElementById('playAgainBtn').addEventListener('click', () => {
  el.resultModal.classList.add('hidden');
  startGame();
});
document.getElementById('resetAllBtn').addEventListener('click', resetAll);

renderCharacters();
renderOutfits();
updatePreview();
renderMoveButtons();
renderLeaderboard();
