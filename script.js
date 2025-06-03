const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverScreen = document.getElementById('gameOverScreen');
const playerNameInput = document.getElementById('playerName');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const restartBtn = document.getElementById('restartBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const highestScoreDisplay = document.getElementById('highestScoreDisplay');

const CANVAS_SIZE = 600;
const CELL_SIZE = 25;
const ROWS = CANVAS_SIZE / CELL_SIZE;
const COLS = CANVAS_SIZE / CELL_SIZE;

let snake;
let direction;
let food;
let score;
let gameOver = false;
let gameInterval;

const backendURL = 'http://localhost:3000'; // Change if deployed elsewhere

function init() {
  snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
  direction = { x: 0, y: 0 };
  placeFood();
  score = 0;
  scoreDisplay.textContent = score;
  gameOver = false;
  gameOverScreen.style.display = 'none';
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 100);
  fetchHighscore();
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS),
  };
  // Make sure food isn't on snake
  while (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
    food.x = Math.floor(Math.random() * COLS);
    food.y = Math.floor(Math.random() * ROWS);
  }
}

function gameLoop() {
  if (gameOver) return;
  moveSnake();
  checkCollision();
  checkFood();
  draw();
}

function moveSnake() {
  if (direction.x === 0 && direction.y === 0) return; // no move yet
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  snake.unshift(head);
  snake.pop();
}

function checkCollision() {
  const head = snake[0];

  // Check walls
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    gameOverHandler();
    return;
  }

  // Check self collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameOverHandler();
      return;
    }
  }
}

function checkFood() {
  const head = snake[0];
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreDisplay.textContent = score;
    snake.push({}); // add dummy tail to grow

    placeFood();
  }
}

function draw() {
  // Clear
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw background with subtle animation
  drawBackground();

  // Draw food with gradient
  const gradFood = ctx.createRadialGradient(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 4,
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 1.2
  );
  gradFood.addColorStop(0, '#ff6347');
  gradFood.addColorStop(1, '#ff0000');
  ctx.fillStyle = gradFood;
  ctx.beginPath();
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2.2,
    0,
    2 * Math.PI
  );
  ctx.fill();

  // Draw snake with gradient and snake-like body
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const x = seg.x * CELL_SIZE;
    const y = seg.y * CELL_SIZE;

    let grad = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
    if (i === 0) {
      // Head gradient - bright green with eyes
      grad.addColorStop(0, '#00ff00');
      grad.addColorStop(1, '#006400');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

      // Draw eyes
      ctx.fillStyle = 'white';
      const eyeSize = CELL_SIZE / 6;
      ctx.beginPath();
      ctx.arc(x + CELL_SIZE / 4, y + CELL_SIZE / 3, eyeSize, 0, 2 * Math.PI);
      ctx.arc(x + (3 * CELL_SIZE) / 4, y + CELL_SIZE / 3, eyeSize, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x + CELL_SIZE / 4, y + CELL_SIZE / 3, eyeSize / 2, 0, 2 * Math.PI);
      ctx.arc(x + (3 * CELL_SIZE) / 4, y + CELL_SIZE / 3, eyeSize / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Body gradient green shades
      grad.addColorStop(0, '#228B22');
      grad.addColorStop(1, '#006400');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

      // Add subtle stripes
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 5);
      ctx.lineTo(x + CELL_SIZE - 5, y + CELL_SIZE - 5);
      ctx.moveTo(x + CELL_SIZE - 5, y + 5);
      ctx.lineTo(x + 5, y + CELL_SIZE - 5);
      ctx.stroke();
    }
  }
}

let bgHue = 0;
function drawBackground() {
  bgHue = (bgHue + 0.2) % 360;
  const bgGradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (document.body.classList.contains('dark-mode')) {
    bgGradient.addColorStop(0, `hsl(${bgHue}, 40%, 15%)`);
    bgGradient.addColorStop(1, `hsl(${(bgHue + 60) % 360}, 50%, 25%)`);
  } else {
    bgGradient.addColorStop(0, `hsl(${bgHue}, 60%, 80%)`);
    bgGradient.addColorStop(1, `hsl(${(bgHue + 60) % 360}, 80%, 60%)`);
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function gameOverHandler() {
  gameOver = true;
  clearInterval(gameInterval);
  vibrateDevice();
  flashRedBorder(5);
  gameOverScreen.style.display = 'block';
}

function vibrateDevice() {
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
}

function flashRedBorder(times) {
  let flashes = 0;
  const interval = setInterval(() => {
    if (flashes % 2 === 0) {
      canvas.style.borderColor = 'red';
    } else {
      canvas.style.borderColor = '';
    }
    flashes++;
    if (flashes > times * 2) {
      clearInterval(interval);
      canvas.style.borderColor = '';
    }
  }, 200);
}

// Controls: WASD + Arrow keys
window.addEventListener('keydown', (e) => {
  if (gameOver) return;
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (direction.y === 1) break;
      direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (direction.y === -1) break;
      direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (direction.x === 1) break;
      direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (direction.x === -1) break;
      direction = { x: 1, y: 0 };
      break;
  }
});

// Touch swipe support for mobile
let touchStartX = null;
let touchStartY = null;
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});
canvas.addEventListener('touchmove', (e) => {
  if (!touchStartX || !touchStartY) return;
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && direction.x !== -1) direction = { x: 1, y: 0 };
    else if (dx < -30 && direction.x !== 1) direction = { x: -1, y: 0 };
  } else {
    if (dy > 30 && direction.y !== -1) direction = { x: 0, y: 1 };
    else if (dy < -30 && direction.y !== 1) direction = { x: 0, y: -1 };
  }
  touchStartX = null;
  touchStartY = null;
  e.preventDefault();
});

// Submit highscore button
submitScoreBtn.addEventListener('click', async () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }
  try {
    const res = await fetch(`${backendURL}/highscore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
    const data = await res.json();
    alert(data.message);
    fetchHighscore();
  } catch {
    alert('Error submitting score');
  }
});

// Restart game button
restartBtn.addEventListener('click', () => {
  playerNameInput.value = '';
  init();
});

// Dark mode toggle button
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

async function fetchHighscore() {
  try {
    const res = await fetch(`${backendURL}/highscore`);
    const highscore = await res.json();
    if (highscore.name && highscore.score > 0) {
      highestScoreDisplay.textContent = `${highscore.name}: ${highscore.score}`;
    } else {
      highestScoreDisplay.textContent = 'No highscore yet';
    }
  } catch {
    highestScoreDisplay.textContent = 'Error loading highscore';
  }
}

// Start the game initially
init();
