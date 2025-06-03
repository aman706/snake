const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

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
  score = parseInt(localStorage.getItem('snakeScore')) || 0;
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

  // Bonus food disappears after 7 seconds if not eaten
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
      grad.addColorStop(0, `hsl(${(baseHue + 340) % 360}, 85%, 75%)`);
      grad.addColorStop(1, `hsl(${(baseHue + 20) % 360}, 100%, 65%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);

      // Eyes
      ctx.fillStyle = '#222';
      const eyeRadius = cellSize / 10;
      ctx.beginPath();
      ctx.arc(segment.x * cellSize + cellSize * 0.3, segment.y * cellSize + cellSize * 0.35, eyeRadius, 0, Math.PI * 2);
      ctx.arc(segment.x * cellSize + cellSize * 0.7, segment.y * cellSize + cellSize * 0.35, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const hue1 = (baseHue + 190) % 360;
      const hue2 = (baseHue + 230) % 360;
      const grad = ctx.createLinearGradient(segment.x * cellSize, segment.y * cellSize, segment.x * cellSize + cellSize, segment.y * cellSize + cellSize);
      grad.addColorStop(0, `hsl(${hue1}, 80%, 70%)`);
      grad.addColorStop(1, `hsl(${hue2}, 90%, 75%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    }
  });
}

function drawFood() {
  const x = food.x;
  const y = food.y;

  const grad = ctx.createRadialGradient(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 6,
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2
  );

  const foodHue = (gradientOffset * 2) % 360;
  grad.addColorStop(0, `hsl(${foodHue}, 90%, 80%)`);
  grad.addColorStop(1, `hsl(${(foodHue + 30) % 360}, 100%, 50%)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2.5,
    cellSize / 2.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawBonusFood() {
  if (!bonusFood) return;

  const x = bonusFood.x;
  const y = bonusFood.y;

  const grad = ctx.createRadialGradient(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 6,
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2
  );

  // Yellow-orange glowing bonus food
  const foodHue = (gradientOffset * 4 + 50) % 360;
  grad.addColorStop(0, `hsl(${foodHue}, 100%, 80%)`);
  grad.addColorStop(1, `hsl(${(foodHue + 40) % 360}, 100%, 45%)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2.2,
    cellSize / 2.2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Bonus glow outline
  ctx.strokeStyle = `hsl(${foodHue}, 100%, 75%)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2.2,
    cellSize / 2.2,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();
}

function moveSnake() {
  const head = { ...snake[0] };

  direction = nextDirection;

  if (direction === 'RIGHT') head.x++;
  else if (direction === 'LEFT') head.x--;
  else if (direction === 'UP') head.y--;
  else if (direction === 'DOWN') head.y++;

  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    return gameOverHandler();
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return gameOverHandler();
  }

  snake.unshift(head);

  // Check if ate bonus food
  if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
    score += 5;
    localStorage.setItem('snakeScore', score);
    scoreEl.textContent = score;
    bonusFood = null;
    clearTimeout(bonusTimeoutId);
    // Increase bonus interval by 2
    bonusInterval += 2;
  }
  // Check if ate normal food
  else if (head.x === food.x && head.y === food.y) {
    score++;
    foodsEaten++;
    localStorage.setItem('snakeScore', score);
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
      canvas.style.borderColor = '#61dafb';
      setTimeout(init, 5000);
      return;
    }
    canvas.style.borderColor = on ? 'red' : '#61dafb';
    on = !on;
    count++;
  }, 400);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

restartBtn.addEventListener('click', () => {
  init();
  canvas.focus();
});

init();
canvas.focus();
