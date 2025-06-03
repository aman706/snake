const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const body = document.body;

const cellSize = 25;
const rows = 20;
const cols = 30;

function resizeCanvas() {
  const maxWidth = window.innerWidth - 32;
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  if (canvas.width > maxWidth) {
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (maxWidth * rows) / cols + 'px';
  } else {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
  }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let food = {};
let bonusFood = null;
let score = 0;
let gameOver = false;
let gameInterval;

let gradientOffset = 0;

let foodsEaten = 0;
let bonusInterval = 5;
let bonusTimeoutId = null;

function init() {
  score = 0;
  scoreEl.textContent = score;

  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  gameOver = false;
  foodsEaten = 0;
  bonusInterval = 5;
  bonusFood = null;
  clearTimeout(bonusTimeoutId);
  placeFood();
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 100);
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  } while (
    snake.some(seg => seg.x === food.x && seg.y === food.y) ||
    (bonusFood && bonusFood.x === food.x && bonusFood.y === food.y)
  );
}

function placeBonusFood() {
  do {
    bonusFood = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  } while (
    snake.some(seg => seg.x === bonusFood.x && seg.y === bonusFood.y) ||
    (food.x === bonusFood.x && food.y === bonusFood.y)
  );

  bonusTimeoutId = setTimeout(() => {
    bonusFood = null;
  }, 7000);
}

function drawCell(x, y, colorStart, colorEnd) {
  const grad = ctx.createLinearGradient(x * cellSize, y * cellSize, x * cellSize + cellSize, y * cellSize + cellSize);
  grad.addColorStop(0, colorStart);
  grad.addColorStop(1, colorEnd);

  ctx.fillStyle = grad;
  ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
}

function drawSnake() {
  snake.forEach((segment, i) => {
    const baseHue = (gradientOffset + i * 20) % 360;
    if (i === 0) {
      const grad = ctx.createLinearGradient(segment.x * cellSize, segment.y * cellSize, segment.x * cellSize + cellSize, segment.y * cellSize + cellSize);
      grad.addColorStop(0, `hsl(${baseHue}, 100%, 55%)`);
      grad.addColorStop(1, `hsl(${(baseHue + 60) % 360}, 100%, 65%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);

      // Snake head eyes
      ctx.fillStyle = '#fff';
      const eyeSize = cellSize / 6;
      if (direction === 'RIGHT') {
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.75, segment.y * cellSize + cellSize * 0.3, eyeSize, eyeSize * 1.3, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.75, segment.y * cellSize + cellSize * 0.7, eyeSize, eyeSize * 1.3, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.75, segment.y * cellSize + cellSize * 0.3, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.75, segment.y * cellSize + cellSize * 0.7, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else if (direction === 'LEFT') {
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.25, segment.y * cellSize + cellSize * 0.3, eyeSize, eyeSize * 1.3, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.25, segment.y * cellSize + cellSize * 0.7, eyeSize, eyeSize * 1.3, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.25, segment.y * cellSize + cellSize * 0.3, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.25, segment.y * cellSize + cellSize * 0.7, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else if (direction === 'UP') {
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.3, segment.y * cellSize + cellSize * 0.25, eyeSize * 1.3, eyeSize, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.7, segment.y * cellSize + cellSize * 0.25, eyeSize * 1.3, eyeSize, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.3, segment.y * cellSize + cellSize * 0.25, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.7, segment.y * cellSize + cellSize * 0.25, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else if (direction === 'DOWN') {
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.3, segment.y * cellSize + cellSize * 0.75, eyeSize * 1.3, eyeSize, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.7, segment.y * cellSize + cellSize * 0.75, eyeSize * 1.3, eyeSize, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(segment.x * cellSize + cellSize * 0.3, segment.y * cellSize + cellSize * 0.75, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.ellipse(segment.x * cellSize + cellSize * 0.7, segment.y * cellSize + cellSize * 0.75, eyeSize / 2, eyeSize / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else {
      const grad = ctx.createLinearGradient(segment.x * cellSize, segment.y * cellSize, segment.x * cellSize + cellSize, segment.y * cellSize + cellSize);
      grad.addColorStop(0, `hsl(${baseHue}, 80%, 45%)`);
      grad.addColorStop(1, `hsl(${(baseHue + 50) % 360}, 80%, 55%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(segment.x * cellSize + 2, segment.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
  });
}

function drawFood() {
  drawCell(food.x, food.y, '#ff6b6b', '#ff3d3d');
}

function drawBonusFood() {
  if (!bonusFood) return;
  const glowGradient = ctx.createRadialGradient(
    bonusFood.x * cellSize + cellSize / 2,
    bonusFood.y * cellSize + cellSize / 2,
    cellSize / 6,
    bonusFood.x * cellSize + cellSize / 2,
    bonusFood.y * cellSize + cellSize / 2,
    cellSize / 2
  );
  glowGradient.addColorStop(0, '#ffd54f');
  glowGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(bonusFood.x * cellSize + cellSize / 2, bonusFood.y * cellSize + cellSize / 2, cellSize / 2, 0, 2 * Math.PI);
  ctx.fill();

  drawCell(bonusFood.x, bonusFood.y, '#f9a825', '#ffca28');
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function vibrateDevice() {
  if (navigator.vibrate) {
    navigator.vibrate([300, 200, 300]);
  }
}

function flashRedBorder(times) {
  let count = 0;
  let on = false;
  const interval = setInterval(() => {
    if (count >= times * 2) {
      clearInterval(interval);
      canvas.style.borderColor = body.classList.contains('dark') ? '#bb86fc' : '#61dafb';
      return;
    }
    canvas.style.borderColor = on ? 'red' : (body.classList.contains('dark') ? '#bb86fc' : '#61dafb');
    on = !on;
    count++;
  }, 400);
}

function moveSnake() {
  direction = nextDirection;
  const head = { ...snake[0] };

  if (direction === 'RIGHT') head.x++;
  else if (direction === 'LEFT') head.x--;
  else if (direction === 'UP') head.y--;
  else if (direction === 'DOWN') head.y++;

  // Check collisions with wall
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    gameOverHandler();
    return;
  }

  // Check collisions with itself
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    gameOverHandler();
    return;
  }

  snake.unshift(head);

  // Check if ate bonus food
  if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
    score += 5;
    scoreEl.textContent = score;
    bonusFood = null;
    clearTimeout(bonusTimeoutId);
    bonusInterval += 2;
  }
  // Check if ate normal food
  else if (head.x === food.x && head.y === food.y) {
    score++;
    foodsEaten++;
    scoreEl.textContent = score;
    placeFood();

    if (foodsEaten >= bonusInterval) {
      foodsEaten = 0;
      placeBonusFood();
    }
  } else {
    snake.pop();
  }
}

function gameOverHandler() {
  gameOver = true;
  clearInterval(gameInterval);
  vibrateDevice();
  flashRedBorder(5);
}

function gameLoop() {
  if (gameOver) return;

  clearCanvas();
  moveSnake();
  drawFood();
  drawBonusFood();
  drawSnake();

  gradientOffset += 2;
  if (gradientOffset >= 360) gradientOffset = 0;
}

window.addEventListener('keydown', (e) => {
  if (gameOver) return;

  const key = e.key.toLowerCase();

  if (key === 'w' && direction !== 'DOWN') nextDirection = 'UP';
  else if (key === 's' && direction !== 'UP') nextDirection = 'DOWN';
  else if (key === 'a' && direction !== 'RIGHT') nextDirection = 'LEFT';
  else if (key === 'd' && direction !== 'LEFT') nextDirection = 'RIGHT';
});

let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', (e) => {
  if (gameOver) return;

  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener('touchmove', (e) => {
  if (gameOver) return;

  if (!touchStartX || !touchStartY) return;

  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 20 && direction !== 'LEFT') {
      nextDirection = 'RIGHT';
      touchStartX = null;
      touchStartY = null;
    } else if (deltaX < -20 && direction !== 'RIGHT') {
      nextDirection = 'LEFT';
      touchStartX = null;
      touchStartY = null;
    }
  } else {
    if (deltaY > 20 && direction !== 'UP') {
      nextDirection = 'DOWN';
      touchStartX = null;
      touchStartY = null;
    } else if (deltaY < -20 && direction !== 'DOWN') {
      nextDirection = 'UP';
      touchStartX = null;
      touchStartY = null;
    }
  }
});

// Restart button manually restarts the game
restartBtn.addEventListener('click', () => {
  init();
  canvas.focus();
});

// Dark mode toggle button
toggleModeBtn.addEventListener('click', () => {
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    toggleModeBtn.textContent = 'Dark Mode';
    canvas.style.borderColor = '#61dafb';
  } else {
    body.classList.add('dark');
    toggleModeBtn.textContent = 'Light Mode';
    canvas.style.borderColor = '#bb86fc';
  }
});

init();
canvas.focus();
