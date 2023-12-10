// Define HTML elements
const board = document.getElementById('game-board');
const instructionText = document.getElementById('instruction-text');
const scoreElement = document.getElementById('score');
const highScoreText = document.getElementById('highScore');
const link = document.getElementById('extLink');
// const logo = document.getElementById('logo'); // Commented out logo element

// Game variables
const gridSize = 20;
const SWIPE_THRESHOLD = 10;

let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let highScore = 0;
let direction = 'right';
let gameInterval;
let gameSpeedDelay = 200;
let gameStarted = false;
let touchStartX, touchStartY;

// Draw game map, snake, food
function draw() {
  clearBoard();
  drawSnake();
  drawFood();
  updateScore();
}

// Clear the game board
function clearBoard() {
  board.innerHTML = '';
}

// Draw the snake on the board
function drawSnake() {
  snake.forEach(segment => drawElement('snake', segment, 'snake'));
}

// Create a game element and set its position
function drawElement(type, position, classLabel) {
  const element = createGameElement('div', classLabel);
  setPosition(element, position);
  board.appendChild(element);
}

// Create a game element
function createGameElement(tag, classLabel) {
  const element = document.createElement(tag);
  element.className = classLabel;
  return element;
}

// Set the position of a game element
function setPosition(element, position) {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;
}

// Draw the food on the board
function drawFood() {
  if (gameStarted) {
    drawElement('food', food, 'food');
  }
}

// Generate random food position
function generateFood() {
  const x = Math.floor(Math.random() * gridSize) + 1;
  const y = Math.floor(Math.random() * gridSize) + 1;
  return { x, y };
}

// Move the snake
function move() {
  const head = { ...snake[0] };
  updateHeadPosition(head);

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    handleFoodCollision();
  } else {
    snake.pop();
  }
}

// Update the position of the snake head based on the current direction
function updateHeadPosition(head) {
  switch (direction) {
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
    case 'left':
      head.x--;
      break;
    case 'right':
      head.x++;
      break;
  }
}

// Handle collision with food
function handleFoodCollision() {
  food = generateFood();
  increaseSpeed();
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    move();
    checkCollision();
    draw();
  }, gameSpeedDelay);
}

// Start the game
function startGame() {
  gameStarted = true;
  instructionText.style.display = 'none';
  link.style.display = 'none';
  gameInterval = setInterval(() => {
    move();
    checkCollision();
    draw();
  }, gameSpeedDelay);
}

// Handle keypress event
function handleKeyPress(event) {
  if (!gameStarted && event.key === ' ') {
    startGame();
  } else {
    handleArrowKeys(event);
  }
}

// Handle arrow key input
function handleArrowKeys(event) {
  switch (event.key) {
    case 'ArrowUp':
      direction = 'up';
      break;
    case 'ArrowDown':
      direction = 'down';
      break;
    case 'ArrowLeft':
      direction = 'left';
      break;
    case 'ArrowRight':
      direction = 'right';
      break;
  }
}

// Handle touchstart event
function handleTouchStart(event) {
  if (event.type === 'touchstart') {
    // Check if the touch event occurred on the game board
    if (event.target === board) {
      startGame();
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }
  }
}

// Handle touchmove event
function handleTouchMove(event) {
  // Check if the touch event occurred on the game board
  if (event.target === board) {
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = touchEndY - touchStartY;

    handleSwipe(swipeDistanceX, swipeDistanceY);
  }
}

// Handle swipe gestures
function handleSwipe(swipeDistanceX, swipeDistanceY) {
  if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
    handleHorizontalSwipe(swipeDistanceX);
  } else {
    handleVerticalSwipe(swipeDistanceY);
  }
}

// Handle horizontal swipe
function handleHorizontalSwipe(swipeDistanceX) {
  if (swipeDistanceX > SWIPE_THRESHOLD) {
    direction = 'right';
  } else if (swipeDistanceX < -SWIPE_THRESHOLD) {
    direction = 'left';
  }
}

// Handle vertical swipe
function handleVerticalSwipe(swipeDistanceY) {
  if (swipeDistanceY > SWIPE_THRESHOLD) {
    direction = 'down';
  } else if (swipeDistanceY < -SWIPE_THRESHOLD) {
    direction = 'up';
  }
}

// Increase the game speed
function increaseSpeed() {
  if (gameSpeedDelay > 25) {
    gameSpeedDelay -= gameSpeedDelay > 150 ? 5 : gameSpeedDelay > 100 ? 3 : gameSpeedDelay > 50 ? 2 : 1;
  }
}

// Check for collision with walls or itself
function checkCollision() {
  const head = snake[0];

  if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
    resetGame();
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      resetGame();
    }
  }
}

// Reset the game state
function resetGame() {
  updateHighScore();
  stopGame();
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = 'right';
  gameSpeedDelay = 200;
  updateScore();
}

// Update the displayed score
function updateScore() {
  const currentScore = snake.length - 1;
  scoreElement.textContent = currentScore.toString().padStart(3, '0');
}

// Stop the game
function stopGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  instructionText.style.display = 'block';
  link.style.display = 'flex';
  // logo.style.display = 'block'; // Restore logo display
}

// Update the high score
function updateHighScore() {
  const currentScore = snake.length - 1;
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.textContent = highScore.toString().padStart(3, '0');
  }
  highScoreText.style.display = 'block';
}

// Event listeners
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
