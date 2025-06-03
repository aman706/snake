// Get DOM elements
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');
const modeToggle = document.getElementById('modeToggle');
const countdownEl = document.getElementById('countdown');
const achievementsEl = document.getElementById('achievements');
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

const box = 20;
const rowCount = canvas.width / box;
const colCount = canvas.height / box;

let snake = [];
let direction = 'RIGHT';
let food = {};
let score = 0;
let highScore = 0;
let gameInterval = null;
let speed = 125;
let paused = false;
let countdown = 3;
let gameStarted = false;
let achievements = new Set();

// Load sounds
const eatSound = new Audio('https://actions.google.com/sounds/v1/food/chomp.ogg');
const gameOverSound = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');
const bgMusic = new Audio('https://actions.google.com/sounds/v1/ambiences/underwater_bubbles.ogg');
bgMusic.loop = true;
bgMusic.volume = 0.15;

function init() {
  // Load high score
  const savedHigh = localStorage.getItem('snakeHighScore');
  highScore = savedHigh ? parseInt(savedHigh) : 0;
  highscoreEl.textContent = highScore;

  // Reset game variables
  snake = [{ x: 5 * box, y: 5 * box }];
  direction = 'RIGHT';
  score = 0;
  scoreEl.textContent = score;
  achievements.clear();
  achievementsEl.textContent = '';

  // Place food
  placeFood();

  // Set speed from difficulty select
  speed = parseInt(difficultySelect.value);

  // Set theme
  setTheme(themeSelect.value);

  paused = false;
  gameStarted = false;

  countdown = 3;
  countdownEl.textContent = countdown;

  clearInterval(gameInterval);

  startCountdown();
}

function startCountdown() {
  countdownEl.style.display = 'block';
  let count = countdown;
  const countdownTimer = setInterval(() => {
    countdownEl.textContent = count === 0 ? 'GO!' : count;
    if (count === 0) {
      clearInterval(countdownTimer);
      countdownEl.style.display = 'none';
      gameStarted = true;
      startGame();
      if (!bgMusic.paused) bgMusic.play();
    }
    count--;
  }, 1000);
}

function startGame() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
}

function placeFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * rowCount) * box,
      y: Math.floor(Math.random() * colCount) * box
    };
  } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
  food = newFood;
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw food with pulse animation
  const time = Date.now() / 500;
  const pulse = Math.sin(time) * 5 + 15;
  ctx.fillStyle = getThemeColors().food;
  ctx.beginPath();
  ctx.arc(food.x + box/2, food.y + box/2, pulse/2, 0, Math.PI * 2);
  ctx.fill();

  // Draw snake with segments as ovals and eyes on head
  ctx.fillStyle = getThemeColors().snake;
  snake.forEach((seg, i) => {
    const radiusX = box / 2.5;
    const radiusY = box / 2;
    ctx.beginPath();
    ctx.ellipse(seg.x + box / 2, seg.y + box / 2, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Draw eyes on the head
    if (i === 0) {
      const eyeRadius = 3;
      let eyeX1 = seg.x + box / 4;
      let eyeX2 = seg.x + box / 4;
      let eyeY = seg.y + box / 3;

      switch(direction) {
        case 'RIGHT':
          eyeX1 = seg.x + box * 0.7;
          eyeX2 = seg.x + box * 0.7;
          eyeY = seg.y + box / 3;
          break;
        case 'LEFT':
          eyeX1 = seg.x + box * 0.3;
          eyeX2 = seg.x + box * 0.3;
          eyeY = seg.y + box / 3;
          break;
        case 'UP':
          eyeX1 = seg.x + box / 3;
          eyeX2 = seg.x + box * 0.66;
          eyeY = seg.y + box * 0.3;
          break;
        case 'DOWN':
          eyeX1 = seg.x + box / 3;
          eyeX2 = seg.x + box * 0.66;
          eyeY = seg.y + box * 0.7;
          break;
      }

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, eyeRadius, 0, 2 * Math.PI);
      ctx.arc(eyeX2, eyeY, eyeRadius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, eyeRadius / 2, 0, 2 * Math.PI);
      ctx.arc(eyeX2, eyeY, eyeRadius / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
}

function update() {
  if (!gameStarted || paused) return;

  const head = { ...snake[0] };

  switch(direction) {
    case 'LEFT': head.x -= box; break;
    case 'RIGHT': head.x += box; break;
    case 'UP': head.y -= box; break;
    case 'DOWN': head.y += box; break;
  }

  // Check collisions with wall
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    gameOver();
    return;
  }

  // Check collision with self
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Check if food eaten
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    eatSound.play();

    // Save high score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', highScore);
      highscoreEl.textContent = highScore;
      showAchievement('New High Score!');
    }

    placeFood();
    checkAchievements();

  } else {
    snake.pop();
  }
}

function gameLoop() {
  update();
  draw();
}

function gameOver() {
  paused = true;
  clearInterval(gameInterval);
  gameOverSound.play();
  canvas.style.borderColor = 'red';

  // Blink effect for 5 seconds before restart
  let blinkCount = 0;
  const maxBlinks = 10;
  const blinkInterval = setInterval(() => {
    canvas.style.visibility = (canvas.style.visibility === 'hidden') ? 'visible' : 'hidden';
    blinkCount++;
    if (blinkCount > maxBlinks) {
      clearInterval(blinkInterval);
      canvas.style.visibility = 'visible';
      canvas.style.borderColor = getThemeColors().border;
      restartGame();
    }
  }, 500);
}

function restartGame() {
  paused = false;
  init();
}

// Change direction safely
function changeDirection(newDir) {
  if (paused) return;
  const opposites = {
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT',
    'UP': 'DOWN',
    'DOWN': 'UP',
  };
  if (newDir !== opposites[direction]) {
    direction = newDir;
  }
}

// Keyboard controls
document.addEventListener('keydown', e => {
  switch (e.key.toLowerCase()) {
    case 'w':
    case 'arrowup': changeDirection('UP'); break;
    case 'a':
    case 'arrowleft': changeDirection('LEFT'); break;
    case 's':
    case 'arrowdown': changeDirection('DOWN'); break;
    case 'd':
    case 'arrowright': changeDirection('RIGHT'); break;
  }
});

// Button controls
btnUp.addEventListener('click', () => changeDirection('UP'));
btnDown.addEventListener('click', () => changeDirection('DOWN'));
btnLeft.addEventListener('click', () => changeDirection('LEFT'));
btnRight.addEventListener('click', () => changeDirection('RIGHT'));

// Pause button
pauseBtn.addEventListener('click', () => {
  if (!gameStarted) return;
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) {
    startGame();
  } else {
    clearInterval(gameInterval);
  }
});

// Restart button
restartBtn.addEventListener('click', () => {
  if (!gameStarted) {
    startCountdown();
  } else {
    restartGame();
  }
});

// Difficulty selector
difficultySelect.addEventListener('change', () => {
  speed = parseInt(difficultySelect.value);
  if (!paused && gameStarted) {
    startGame();
  }
});

// Theme selector
themeSelect.addEventListener('change', () => {
  setTheme(themeSelect.value);
});

modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Themes config
const themes = {
  classic: {
    snake: '#00ff00',
    food: '#ff0000',
    border: '#00ff00',
  },
  neon: {
    snake: '#ff00ff',
    food: '#00ffff',
    border: '#ff00ff',
  },
  dark: {
    snake: '#888',
    food: '#f00',
    border: '#888',
  }
};

function setTheme(name) {
  document.body.classList.remove('theme-classic', 'theme-neon', 'theme-dark');
  document.body.classList.add('theme-' + name);
}

function getThemeColors() {
  return themes[themeSelect.value] || themes.classic;
}

// Achievements system
function checkAchievements() {
  if (score === 5 && !achievements.has('5pts')) {
    achievements.add('5pts');
    showAchievement('5 points reached!');
  }
  if (score === 10 && !achievements.has('10pts')) {
    achievements.add('10pts');
    showAchievement('10 points reached!');
  }
  if (score === 20 && !achievements.has('20pts')) {
    achievements.add('20pts');
    showAchievement('20 points reached!');
  }
}

function showAchievement(text) {
  achievementsEl.textContent = text;
  setTimeout(() => {
    achievementsEl.textContent = '';
  }, 3000);
}

// Mobile swipe detection for controls
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', e => {
  const touch = e.changedTouches[0];
  touchStartX = touch.screenX;
  touchStartY = touch.screenY;
  e.preventDefault();
}, {passive:false});

canvas.addEventListener('touchend', e => {
  if (!touchStartX || !touchStartY) return;
  const touch = e.changedTouches[0];
  const dx = touch.screenX - touchStartX;
  const dy = touch.screenY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // horizontal swipe
    if (dx > 30) changeDirection('RIGHT');
    else if (dx < -30) changeDirection('LEFT');
  } else {
    // vertical swipe
    if (dy > 30) changeDirection('DOWN');
    else if (dy < -30) changeDirection('UP');
  }

  touchStartX = null;
  touchStartY = null;
  e.preventDefault();
}, {passive:false});

// Start game on load
init();

// Auto-focus canvas for keyboard control on desktop
canvas.focus();
