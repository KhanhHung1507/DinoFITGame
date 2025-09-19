// Thông tin bạn muốn hiển thị trong khung chat
const infoMessages = [
  "Tên: Nguyễn Văn A",
  "Sở thích: Lập trình game, design",
  "Điểm mạnh: Sáng tạo, chủ động",
  "Kỳ vọng: Học hỏi và phát triển bản thân"
];

let currentMsg = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Thiết lập kích thước canvas thực tế
function resizeCanvas() {
  canvas.width = window.innerWidth;
  // chiều cao canvas chỉ chiếm phần dưới màn hình
  canvas.height = 200; 
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Tải hình ảnh
const dinoImg = new Image();
dinoImg.src = 'dino-fit.png'; // bạn cần ảnh con khủng long mặc áo FIT

const cactusImgs = []; 
// Ví dụ: các môn học, dùng hình ảnh hoặc chữ, mình dùng hình ảnh placeholder
const subjects = ['CTDL', 'OOP', 'Mạng', 'Hệ điều hành']; // bạn chỉnh theo môn
subjects.forEach((s, i) => {
  const img = new Image();
  img.src = `cactus_${s}.png`; // bạn cần ảnh xương rồng / biểu tượng cho từng môn
  cactusImgs.push(img);
});

// Các biến game
let dino = {
  x: 50,
  y: 0,
  width: 50,
  height: 50,
  vy: 0,
  gravity: 0.6,
  jumpPower: -12,
  isJumping: false
};

let obstacles = [];
let obstacleSpeed = 5;
let spawnTimer = 0;

let gameOver = false;

// Khung chat
const chatBox = document.getElementById('chatBox');
const chatText = document.getElementById('chatText');

// Hàm hiển thị chat
function showChat() {
  chatText.textContent = infoMessages[currentMsg];
  chatBox.classList.remove('hidden');
  chatBox.classList.add('visible');
  currentMsg = (currentMsg + 1) % infoMessages.length;
  // ẩn sau vài giây
  setTimeout(() => {
    chatBox.classList.remove('visible');
    chatBox.classList.add('hidden');
  }, 2000);
}

// Hàm nhảy
function jump() {
  if (!dino.isJumping && dino.y >= 0) {
    dino.vy = dino.jumpPower;
    dino.isJumping = true;
    showChat();
  }
}

// Sự kiện cho desktop
document.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.key === ' ') && !gameOver) {
    jump();
  }
});
document.addEventListener('click', () => {
  if (!gameOver) {
    jump();
  }
});
// Cho mobile
document.addEventListener('touchstart', () => {
  if (!gameOver) {
    jump();
  }
});

// Tạo obstacle
function spawnObstacle() {
  const size = 40; // kích thước
  const subjectIndex = Math.floor(Math.random() * subjects.length);
  const img = cactusImgs[subjectIndex];
  obstacles.push({
    x: canvas.width,
    y: canvas.height - size,
    width: size,
    height: size,
    img: img
  });
}

// Update khủng long
function updateDino() {
  dino.vy += dino.gravity;
  dino.y += dino.vy;
  if (dino.y > 0) {
    // dino đi lên, y negative => trên ground, ground là y=0
  }
  if (dino.y > canvas.height - dino.height) {
    dino.y = canvas.height - dino.height;
    dino.vy = 0;
    dino.isJumping = false;
  }
}

// Update obstacle
function updateObstacles() {
  spawnTimer++;
  if (spawnTimer > 90) { // mỗi khoảng spawn
    spawnObstacle();
    spawnTimer = 0;
  }
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= obstacleSpeed;
    // xóa nếu ra khỏi màn hình
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      i--;
    }
  }
}

// Vẽ mọi thứ
function draw() {
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // vẽ dino
  ctx.drawImage(dinoImg, dino.x, canvas.height - dino.height - dino.y, dino.width, dino.height);
  // vẽ obstacles
  obstacles.forEach(obs => {
    if (obs.img.complete) {
      ctx.drawImage(obs.img, obs.x, canvas.height - obs.height, obs.width, obs.height);
    } else {
      // nếu ảnh chưa load, vẽ hình chữ nhật placeholder
      ctx.fillStyle = 'green';
      ctx.fillRect(obs.x, canvas.height - obs.height, obs.width, obs.height);
    }
  });
}

// Kiểm tra va chạm
function checkCollision() {
  for (let obs of obstacles) {
    if (
      dino.x < obs.x + obs.width &&
      dino.x + dino.width > obs.x &&
      (canvas.height - dino.height - dino.y) < obs.y + obs.height &&
      (canvas.height - obs.height) < obs.y + obs.height
    ) {
      gameOver = true;
    }
  }
}

// Game loop
function loop() {
  if (gameOver) {
    ctx.font = '48px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    return;
  }
  updateDino();
  updateObstacles();
  draw();
  checkCollision();
  requestAnimationFrame(loop);
}

// Khi ảnh dino load xong thì start game
dinoImg.onload = () => {
  loop();
};
