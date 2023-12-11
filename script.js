// Define HTML elements
const board = document.getElementById("game-board");
const instructionText = document.getElementById("instruction-text");
const score = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const link = document.getElementById("extLink");

// Define game variables
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let highScore = 0;
let direction = "right";
let gameInterval;
let gameSpeedDelay = 200;
let gameStarted = false;

// Draw game map, snake, food
function draw() {
  board.textContent = "";
  drawSnake();
  drawFood();
  updateScore();
}

// Draw snake
function drawSnake() {
  snake.forEach((segment) => {
    const snakeElement = createGameElement("div", "snake");
    setPosition(snakeElement, segment);
    board.appendChild(snakeElement);
  });
}

// Create a snake or food cube/div
function createGameElement(tag, className) {
  const element = document.createElement(tag);
  element.classList.add(className);
  return element;
}

// Set the position of snake or food
function setPosition(element, position) {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;
}

// Testing draw function
// draw();

// Draw food function
function drawFood() {
  if (gameStarted) {
    const foodElement = createGameElement("div", "food");
    setPosition(foodElement, food);
    board.appendChild(foodElement);
  }
}

// Generate food
function generateFood() {
  const x = Math.floor(Math.random() * gridSize) + 1;
  const y = Math.floor(Math.random() * gridSize) + 1;
  return { x, y };
}

// Moving the snake
function move() {
  const head = { ...snake[0] };
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = generateFood();
    increaseSpeed();
    clearInterval(gameInterval); // Clear past interval
    gameInterval = setInterval(() => {
      move();
      checkCollision();
      draw();
    }, gameSpeedDelay);
  } else {
    snake.pop();
  }
}

// Start game function
function startGame() {
  gameStarted = true; // Keep track of a running game
  instructionText.style.display = "none";
  link.style.display = "none";
  gameInterval = setInterval(() => {
    move();
    checkCollision();
    draw();
  }, gameSpeedDelay);
}

function increaseSpeed() {
  if (gameSpeedDelay > 25) {
    gameSpeedDelay -=
      gameSpeedDelay > 150
        ? 5
        : gameSpeedDelay > 100
          ? 3
          : gameSpeedDelay > 50
            ? 2
            : 1;
  }
}

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

function resetGame() {
  updateHighScore();
  stopGame();
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = "right";
  gameSpeedDelay = 200;
  updateScore();
}

function updateScore() {
  const currentScore = snake.length - 1;
  score.textContent = currentScore.toString().padStart(3, "0");
}

function stopGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  instructionText.style.display = "block";
  link.style.display = "block";
}

function updateHighScore() {
  const currentScore = snake.length - 1;
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.textContent = highScore.toString().padStart(3, "0");
  }
  highScoreText.style.display = "block";
}

function isOppositeDirection(dir1, dir2) {
  return (
    (dir1 === "up" && dir2 === "down") ||
    (dir1 === "down" && dir2 === "up") ||
    (dir1 === "left" && dir2 === "right") ||
    (dir1 === "right" && dir2 === "left")
  );
}

// Variables to track input during dragging
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function getDirectionFromKey(key) {
  switch (key) {
    case "ArrowUp":
      return "up";
    case "ArrowDown":
      return "down";
    case "ArrowLeft":
      return "left";
    case "ArrowRight":
      return "right";
    default:
      return direction;
  }
}

function setDragStart(event) {
  dragStartX = event.clientX;
  dragStartY = event.clientY;
}

function isClickInsideBoard(event) {
  const rect = board.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
}

function setDirectionFromDrag(event) {
  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;
  return Math.abs(deltaX) > Math.abs(deltaY)
    ? deltaX > 0
      ? "right"
      : "left"
    : deltaY > 0
    ? "down"
    : "up";
}

// Event listener for pointerdown, pointermove, and pointerup
function handleInput(event) {
  let newDirection;
  if (
    !gameStarted &&
    ((event.type === "pointerdown" && isClickInsideBoard(event)) ||
      (event.type === "keydown" && event.key === " "))
  ) {
    startGame();
  } else if (gameStarted) {
    switch (event.type) {
      case "keydown":
        newDirection = getDirectionFromKey(event.key);
        break;
      case "pointerdown":
        if (isClickInsideBoard(event)) {
          isDragging = true;
          setDragStart(event);
        }
        break;
      case "pointermove":
        if (isDragging) {
          newDirection = setDirectionFromDrag(event);
        }
        break;
      case "pointerup":
        isDragging = false;
        break;
    }
    if (newDirection !== undefined && !isOppositeDirection(newDirection, direction)) {
      // Ignore opposite direction
      direction = newDirection;
      return;
    }
  }
}

document.addEventListener("keydown", handleInput);
document.addEventListener("pointerdown", handleInput);
document.addEventListener("pointermove", handleInput);
document.addEventListener("pointerup", handleInput);
