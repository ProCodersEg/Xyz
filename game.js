const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const birdImages = [
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/bluebird-midflap.png?raw=true", // Replace with your bird image URLs
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/bluebird-upflap.png?raw=true",
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/bluebird-downflap.png?raw=true"
];
const birdSprites = birdImages.map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const pipeImgTop = new Image();
pipeImgTop.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/pipe-green.png?raw=true"; // Replace with your top pipe image URL

const pipeImgBottom = new Image();
pipeImgBottom.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/pipe-green.png?raw=true"; // Replace with your bottom pipe image URL

const bgImg = new Image();
bgImg.src =
  "https://github.com/samuelcust/flappy-bird-assets/blob/master/sprites/background-day.png?raw=true"; // Replace with your background image URL

const flapSound = new Audio(
  "https://github.com/samuelcust/flappy-bird-assets/raw/master/audio/wing.wav"
); // Replace with your flap sound URL
const scoreSound = new Audio(
  "https://github.com/samuelcust/flappy-bird-assets/raw/master/audio/point.wav"
); // Replace with your score sound URL
const hitSound = new Audio(
  "https://github.com/samuelcust/flappy-bird-assets/raw/master/audio/hit.wav"
); // Replace with your hit sound URL
const bgMusic = new Audio(
  "https://www.dropbox.com/s/ja5r48ewjoof2rg/0139.%20Picnic%20-%20AShamaluevMusic.mp3"
); // Replace with your background music URL
const dieSound = new Audio(
  "https://github.com/samuelcust/flappy-bird-assets/raw/master/audio/die.wav"
); // Replace with your die sound URL
bgMusic.loop = true;

const bird = {
  x: 50,
  y: height / 2,
  size: 20,
  gravity: 0.6,
  lift: -10,
  velocity: 0,
  frame: 0,
  frameCount: 0
};

const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
const pipeFrequency = 90; // frames between pipes
let frameCount = 0;
let score = 0;
let highScore = 0;
let gameStarted = false;
let gameOver = false;
let enableSounds = true;
let volume = 1;

const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");
const menuButton = document.getElementById("menuButton");
const settingsButton = document.getElementById("settingsButton");
const settingsDialog = document.getElementById("settingsDialog");
const toggleSounds = document.getElementById("toggleSounds");
const volumeControl = document.getElementById("volumeControl");
const closeSettingsButton = document.getElementById("closeSettings");

function drawBird() {
  ctx.drawImage(
    birdSprites[bird.frame],
    bird.x - bird.size,
    bird.y - bird.size,
    bird.size * 2,
    bird.size * 2
  );
}

function drawPipes() {
  pipes.forEach((pipe) => {
    ctx.drawImage(pipeImgTop, pipe.x, 0, pipeWidth, pipe.top);
    ctx.drawImage(
      pipeImgBottom,
      pipe.x,
      pipe.top + pipeGap,
      pipeWidth,
      height - pipe.top - pipeGap
    );
  });
}

function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, width, height);
}

function updatePipes() {
  if (frameCount % pipeFrequency === 0) {
    const top = Math.random() * (height - pipeGap - 100) + 50;
    pipes.push({ x: width, top: top });
  }

  pipes.forEach((pipe) => {
    pipe.x -= 3;
  });

  pipes.filter((pipe) => pipe.x + pipeWidth > 0);
}

function checkCollision() {
  if (bird.y + bird.size > height || bird.y - bird.size < 0) {
    hitSound.play();
    dieSound.play();
    resetGame();
  }

  pipes.forEach((pipe) => {
    if (
      bird.x + bird.size > pipe.x &&
      bird.x - bird.size < pipe.x + pipeWidth &&
      (bird.y - bird.size < pipe.top || bird.y + bird.size > pipe.top + pipeGap)
    ) {
      hitSound.play();
      dieSound.play();
      resetGame();
    }
  });
}

function resetGame() {
  if (score > highScore) {
    highScore = score;
  }
  gameStarted = false;
  gameOver = true;
  bird.y = height / 2;
  bird.velocity = 0;
  pipes.length = 0;
  frameCount = 0;
  bgMusic.pause();
  startButton.style.display = "none";
  retryButton.style.display = "block";
  menuButton.style.display = "block";
  drawGameOverScreen();
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);
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

function drawStartScreen() {
  ctx.fillStyle = "#000";
  ctx.font = "30px Arial";
  ctx.fillText("Flappy Bird", width / 2 - 70, height / 2 - 100);
  ctx.font = "20px Arial";
  ctx.fillText(`High Score: ${highScore}`, width / 2 - 50, height / 2 - 30);
}

function drawGameOverScreen() {
  ctx.fillStyle = "#000";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", width / 2 - 70, height / 2 - 100);
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, width / 2 - 30, height / 2 - 60);
  ctx.fillText(`High Score: ${highScore}`, width / 2 - 50, height / 2 - 30);
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  bgMusic.play();
  startButton.style.display = "none";
  retryButton.style.display = "none";
  menuButton.style.display = "none";
}

function gameLoop() {
  ctx.clearRect(0, 0, width, height);
  drawBackground();

  if (gameStarted) {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    updatePipes();
    drawPipes();
    checkCollision();
    updateScore();
    drawBird();
    drawScore();

    bird.frameCount++;
    if (bird.frameCount % 10 === 0) {
      bird.frame = (bird.frame + 1) % birdSprites.length;
    }
  } else {
    if (gameOver) {
      drawGameOverScreen();
    } else {
      drawStartScreen();
    }
  }

  frameCount++;
  requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", () => {
  startGame();
});

retryButton.addEventListener("click", () => {
  startGame();
});

menuButton.addEventListener("click", () => {
  resetGame();
  startButton.style.display = "block";
  retryButton.style.display = "none";
  menuButton.style.display = "none";
  drawStartScreen();
});

settingsButton.addEventListener("click", () => {
  settingsDialog.style.display = "block";
});

closeSettingsButton.addEventListener("click", () => {
  settingsDialog.style.display = "none";
});

toggleSounds.addEventListener("change", () => {
  enableSounds = toggleSounds.checked;
  if (enableSounds) {
    bgMusic.volume = volume;
    flapSound.volume = volume;
    scoreSound.volume = volume;
    hitSound.volume = volume;
    dieSound.volume = volume;
  } else {
    // If sounds are disabled, set volume to 0 for all sounds
    bgMusic.volume = 0;
    flapSound.volume = 0;
    scoreSound.volume = 0;
    hitSound.volume = 0;
    dieSound.volume = 0;
  }
});

volumeControl.addEventListener("input", () => {
  volume = parseFloat(volumeControl.value);
  bgMusic.volume = volume;
  flapSound.volume = volume;
  scoreSound.volume = volume;
  hitSound.volume = volume;
  dieSound.volume = volume;
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted) {
      startGame();
    }
    bird.velocity = bird.lift;
    if (enableSounds) {
      flapSound.play();
    }
  }
});

document.addEventListener("touchstart", () => {
  if (!gameStarted) {
    startGame();
  }
  bird.velocity = bird.lift;
  if (enableSounds) {
    flapSound.play();
  }
});

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

resetGame();
gameLoop();
