// Functional utilities
const getElement = (id) => document.getElementById(id);

const createGameElement = (tag, className) => {
  const element = document.createElement(tag);
  element.classList.add(className);
  return element;
};

const setPosition = (element, position) => {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;
};

const generateRandomCoordinate = (gridSize) => Math.floor(Math.random() * gridSize) + 1;

const generateFood = (gridSize) => ({ x: generateRandomCoordinate(gridSize), y: generateRandomCoordinate(gridSize) });

const drawSnake = (board, snake) => {
  snake.forEach((segment) => {
    const snakeElement = createGameElement("div", "snake");
    setPosition(snakeElement, segment);
    board.appendChild(snakeElement);
  });
};

const drawFood = (board, food, gameStarted) => {
  if (gameStarted) {
    const foodElement = createGameElement("div", "food");
    setPosition(foodElement, food);
    board.appendChild(foodElement);
  }
};

const updateScore = (scoreElement, snake) => {
  const currentScore = snake.length - 1;
  scoreElement.textContent = currentScore.toString().padStart(3, "0");
};

const draw = (gameState) => {
  gameState.board.textContent = "";
  drawSnake(gameState.board, gameState.snake);
  drawFood(gameState.board, gameState.food, gameState.gameStarted);
  updateScore(gameState.score, gameState.snake);
};

// Game functions
const move = (gameState) => {
  const head = { ...gameState.snake[0] };
  switch (gameState.direction) {
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

  gameState.snake.unshift(head);

  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    gameState.food = generateFood(gameState.gridSize);
    increaseSpeed(gameState);
    clearInterval(gameState.gameInterval); // Clear past interval
    gameState.gameInterval = setInterval(() => {
      move(gameState);
      checkCollision(gameState);
      draw(gameState);
    }, gameState.gameSpeedDelay);
  } else {
    gameState.snake.pop();
  }
};

const increaseSpeed = (gameState) => {
  if (gameState.gameSpeedDelay > 25) {
    gameState.gameSpeedDelay -=
      gameState.gameSpeedDelay > 150
        ? 5
        : gameState.gameSpeedDelay > 100
          ? 3
          : gameState.gameSpeedDelay > 50
            ? 2
            : 1;
  }
};

const resetGame = (gameState) => {
  updateHighScore(gameState);
  stopGame(gameState);
  gameState.snake = [{ x: 10, y: 10 }];
  gameState.food = generateFood(gameState.gridSize);
  gameState.direction = "right";
  gameState.gameSpeedDelay = 200;
  updateScore(gameState.score, gameState.snake);
};

const stopGame = (gameState) => {
  clearInterval(gameState.gameInterval);
  gameState.gameStarted = false;
  gameState.instructionText.style.display = "block";
  gameState.link.style.display = "block";
};

const updateHighScore = (gameState) => {
  const currentScore = gameState.snake.length - 1;
  if (currentScore > gameState.highScore) {
    gameState.highScore = currentScore;
    gameState.highScoreText.textContent = gameState.highScore.toString().padStart(3, "0");
  }
  gameState.highScoreText.style.display = "block";
};

const isOppositeDirection = (dir1, dir2) => (
  (dir1 === "up" && dir2 === "down") ||
  (dir1 === "down" && dir2 === "up") ||
  (dir1 === "left" && dir2 === "right") ||
  (dir1 === "right" && dir2 === "left")
);

// Event listener for pointerdown, pointermove, and pointerup
const handleInput = (gameState, event) => {
  let newDirection;
  if (
    !gameState.gameStarted &&
    ((event.type === "pointerdown" && isClickInsideBoard(event, gameState)) ||
      (event.type === "keydown" && event.key === " "))
  ) {
    startGame(gameState);
  } else if (gameState.gameStarted) {
    switch (event.type) {
      case "keydown":
        newDirection = getDirectionFromKey(event.key);
        break;
      case "pointerdown":
        if (isClickInsideBoard(event, gameState)) {
          gameState.isDragging = true;
          setDragStart(event, gameState);
        }
        break;
      case "pointermove":
        if (gameState.isDragging) {
          newDirection = setDirectionFromDrag(event, gameState);
        }
        break;
      case "pointerup":
        gameState.isDragging = false;
        break;
    }
    if (newDirection !== undefined && !isOppositeDirection(newDirection, gameState.direction)) {
      gameState.direction = newDirection;
      return;
    }
  }
};

const getDirectionFromKey = (key) => {
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
      return gameState.direction;
  }
};

const setDragStart = (event, gameState) => {
  gameState.dragStartX = event.clientX;
  gameState.dragStartY = event.clientY;
};

const isClickInsideBoard = (event, gameState) => {
  const rect = gameState.board.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
};

const setDirectionFromDrag = (event, gameState) => {
  const deltaX = event.clientX - gameState.dragStartX;
  const deltaY = event.clientY - gameState.dragStartY;
  return Math.abs(deltaX) > Math.abs(deltaY)
    ? deltaX > 0
      ? "right"
      : "left"
    : deltaY > 0
    ? "down"
    : "up";
};

// Game functions
const startGame = (gameState) => {
  gameState.gameStarted = true;
  gameState.instructionText.style.display = "none";
  gameState.link.style.display = "none";
  gameState.gameInterval = setInterval(() => {
    move(gameState);
    checkCollision(gameState);
    draw(gameState);
  }, gameState.gameSpeedDelay);
};

// Game functions
const checkCollision = (gameState) => {
  const head = gameState.snake[0];

  if (head.x < 1 || head.x > gameState.gridSize || head.y < 1 || head.y > gameState.gridSize) {
    resetGame(gameState);
  }

  for (let i = 1; i < gameState.snake.length; i++) {
    if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
      resetGame(gameState);
    }
  }
};

// Initial game state
const gameState = {
  board: getElement("game-board"),
  instructionText: getElement("instruction-text"),
  score: getElement("score"),
  highScoreText: getElement("highScore"),
  link: getElement("extLink"),
  gridSize: 20,
  snake: [{ x: 10, y: 10 }],
  food: generateFood(20),
  highScore: 0,
  direction: "right",
  gameInterval: null,
  gameSpeedDelay: 200,
  gameStarted: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
};

// Event listeners
document.addEventListener("keydown", handleInput.bind(null, gameState));
document.addEventListener("pointerdown", handleInput.bind(null, gameState));
document.addEventListener("pointermove", handleInput.bind(null, gameState));
document.addEventListener("pointerup", handleInput.bind(null, gameState));