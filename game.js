const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const birdImg = new Image();
birdImg.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/bluebird-midflap.png?raw=true"; // Replace with your bird image URL

const pipeImgTop = new Image();
pipeImgTop.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/pipe-green.png?raw=true"; // Replace with your top pipe image URL

const pipeImgBottom = new Image();
pipeImgBottom.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/pipe-green.png?raw=true"; // Replace with your bottom pipe image URL

const groundImg = new Image();
groundImg.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/base.png?raw=true"; // Replace with your ground image URL

const startImg = new Image();
startImg.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/message.png?raw=true"; // Replace with your start image URL

const flapSound = document.getElementById("flapSound");
const hitSound = document.getElementById("hitSound");
const scoreSound = document.getElementById("scoreSound");
const dieSound = document.getElementById("dieSound");

const scoreImages = [];
for (let i = 0; i <= 9; i++) {
  const img = new Image();
  img.src = `https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/${i}.png?raw=true`;
  scoreImages.push(img);
}

const bird = {
  x: 50,
  y: height / 2,
  size: 20,
  gravity: 0.6,
  lift: -10,
  velocity: 0,
};

const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
const pipeFrequency = 90; // frames between pipes
let frameCount = 0;
let score = 0;
let gameStarted = false;
let showStartImage = true;

let groundOffset = 0;
const groundSpeed = 3; // Adjust ground speed as needed

function drawBird() {
  ctx.drawImage(
    birdImg,
    bird.x - bird.size,
    bird.y - bird.size,
    bird.size * 2,
    bird.size * 2
  );
}

function drawPipes() {
  pipes.forEach((pipe) => {
    // Draw top pipe
    ctx.drawImage(pipeImgTop, pipe.x, pipe.top - pipeImgTop.height, pipeWidth, pipeImgTop.height);

    // Draw bottom pipe
    ctx.drawImage(pipeImgBottom, pipe.x, pipe.bottom, pipeWidth, pipeImgBottom.height);
  });
}

function updatePipes() {
  if (frameCount % pipeFrequency === 0) {
    const pipeHeight = pipeImgTop.height; // Adjust based on your pipe image height
    const minPipeHeight = 50; // Minimum height for the top pipe
    const maxPipeHeight = height - pipeGap - 100 - minPipeHeight; // Adjust to ensure gap and minimum space

    const top = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
    pipes.push({ x: width, top: top });
  }

  pipes.forEach((pipe) => {
    pipe.x -= 3;

    // Calculate bottom pipe position
    pipe.bottom = pipe.top + pipeGap;
  });

  pipes.filter((pipe) => pipe.x + pipeWidth > 0);
}

function checkCollision() {
  if (bird.y + bird.size > height || bird.y - bird.size < 0) {
    die();
  }

  pipes.forEach((pipe) => {
    if (
      bird.x + bird.size > pipe.x &&
      bird.x - bird.size < pipe.x + pipeWidth &&
      (bird.y - bird.size < pipe.top ||
        bird.y + bird.size > pipe.bottom)
    ) {
      die();
    }
  });

  // Check collision with ground
  if (bird.y + bird.size > height - 100) {
    die();
  }
}

function die() {
  dieSound.play();
  resetGame();
}

function resetGame() {
  hitSound.play();
  bird.y = height / 2;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  frameCount = 0;
  gameStarted = false;
  showStartImage = true; // Reset to show start image on next tap
}

function drawScore() {
  const scoreStr = score.toString();
  const scoreContainer = document.getElementById("scoreContainer");
  scoreContainer.innerHTML = "";

  for (let i = 0; i < scoreStr.length; i++) {
    const digit = scoreStr.charAt(i);
    const img = scoreImages[parseInt(digit)];
    const scoreDigit = document.createElement("img");
    scoreDigit.src = img.src;
    scoreDigit.classList.add("score-digit");
    scoreContainer.appendChild(scoreDigit);
  }
}

function updateScore() {
  pipes.forEach((pipe) => {
    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      score++;
      pipe.passed = true;
      scoreSound.play();
    }
  });
}

function flap() {
  flapSound.currentTime = 0;
  flapSound.play();

  if (!gameStarted) {
    gameStarted = true;
    showStartImage = false;
  }

  bird.velocity = bird.lift;
}

function drawGround() {
  ctx.drawImage(groundImg, -groundOffset, height - 100, width, 100);
  ctx.drawImage(groundImg, width - groundOffset, height - 100, width, 100);
}

function drawStartImage() {
  if (showStartImage) {
    ctx.drawImage(
      startImg,
      width / 2 - startImg.width / 2,
      height / 2 - startImg.height / 2
    );
  }
}

function updateGround() {
  if (gameStarted) {
    groundOffset += groundSpeed;
    if (groundOffset >= width) {
      groundOffset = 0;
    }
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, width, height);

  if (gameStarted) {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    updatePipes();
    drawPipes();
    checkCollision();
    updateScore();
  }

  drawGround();
  drawBird();
  drawScore();
  drawStartImage();

  frameCount++;
  updateGround();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    flap();
  }
});

document.addEventListener("touchstart", () => {
  flap();
});

resetGame();
gameLoop();
