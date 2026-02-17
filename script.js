// ----- Canvas setup -----
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Logical game size (fixed internal coordinates)
const GAME_SIZE = 400;
canvas.width = GAME_SIZE;
canvas.height = GAME_SIZE;

// ----- Game objects -----
const player = {
    x: GAME_SIZE / 2,
    y: GAME_SIZE / 2,
    size: 20,
    color: "#42a5f5", // blue
    speed: 20
};

const creeper = {
    x: 60,
    y: 60,
    size: 20,
    color: "#66bb6a", // green
    speed: 1.5
};

const safeHouse = {
    x: GAME_SIZE - 70,
    y: GAME_SIZE - 70,
    size: 40,
    color: "#8d6e63" // brown
};

// Decorations (simple kid-friendly shapes)
const trees = [
    { x: 80, y: 80 },
    { x: 40, y: 300 },
    { x: 300, y: 60 },
    { x: 260, y: 220 }
];

const stones = [
    { x: 150, y: 50 },
    { x: 330, y: 150 },
    { x: 100, y: 220 }
];

const grassPatches = [];
for (let i = 0; i < 5; i++) {
    grassPatches.push({ x: 40 + i * 70, y: 180 });
}

// ----- Input handling -----
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Keyboard controls (laptop/desktop)
document.addEventListener("keydown", (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Swipe controls (mobile)
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener("touchend", (e) => {
    if (touchStartX === null || touchStartY === null) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Determine swipe direction
    if (Math.max(absDx, absDy) < 30) {
        // Too small: ignore tiny swipes
        touchStartX = touchStartY = null;
        return;
    }

    if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) moveRight();
        else moveLeft();
    } else {
        // Vertical swipe
        if (dy > 0) moveDown();
        else moveUp();
    }

    touchStartX = touchStartY = null;
}, { passive: true });

// ----- Movement helpers -----
function moveUp() {
    player.y -= player.speed;
}
function moveDown() {
    player.y += player.speed;
}
function moveLeft() {
    player.x -= player.speed;
}
function moveRight() {
    player.x += player.speed;
}

function handleKeyboardMovement() {
    if (keys.ArrowUp) moveUp();
    if (keys.ArrowDown) moveDown();
    if (keys.ArrowLeft) moveLeft();
    if (keys.ArrowRight) moveRight();
}

// Keep player inside the game area
function clampPlayer() {
    const half = player.size / 2;
    if (player.x < half) player.x = half;
    if (player.x > GAME_SIZE - half) player.x = GAME_SIZE - half;
    if (player.y < half) player.y = half;
    if (player.y > GAME_SIZE - half) player.y = GAME_SIZE - half;
}

// ----- Creeper AI -----
function moveCreeper() {
    const dx = player.x - creeper.x;
    const dy = player.y - creeper.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
        creeper.x += (dx / dist) * creeper.speed;
        creeper.y += (dy / dist) * creeper.speed;
    }
}

// ----- Collision helpers -----
function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function checkCollisions() {
    // Creeper catches player
    if (distance(player, creeper) < (player.size + creeper.size) / 2) {
        alert("BOOM! The Creeper got you!");
        resetGame();
    }

    // Player reaches safe house
    if (distance(player, safeHouse) < (player.size + safeHouse.size) / 2) {
        alert("You reached the Safe House! You win!");
        resetGame();
    }
}

function resetGame() {
    player.x = GAME_SIZE / 2;
    player.y = GAME_SIZE / 2;
    creeper.x = 60;
    creeper.y = 60;
}

// ----- Drawing -----
function drawBackground() {
    // Border
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 5;
    ctx.strokeRect(2.5, 2.5, GAME_SIZE - 5, GAME_SIZE - 5);
}

function drawDecorations() {
    // Trees (green circles with brown trunks)
    trees.forEach(t => {
        // trunk
        ctx.fillStyle = "#8d6e63";
        ctx.fillRect(t.x - 5, t.y + 10, 10, 15);
        // leaves
        ctx.fillStyle = "#2e7d32";
        ctx.beginPath();
        ctx.arc(t.x, t.y, 15, 0, Math.PI * 2);
        ctx.fill();
    });

    // Stones (small gray squares)
    stones.forEach(s => {
        ctx.fillStyle = "#9e9e9e";
        ctx.fillRect(s.x, s.y, 15, 15);
    });

    // Grass patches (small light squares)
    grassPatches.forEach(g => {
        ctx.fillStyle = "#a5d6a7";
        ctx.fillRect(g.x, g.y, 12, 12);
    });
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(
        player.x - player.size / 2,
        player.y - player.size / 2,
        player.size,
        player.size
    );
}

function drawCreeper() {
    ctx.fillStyle = creeper.color;
    ctx.fillRect(
        creeper.x - creeper.size / 2,
        creeper.y - creeper.size / 2,
        creeper.size,
        creeper.size
    );
}

function drawSafeHouse() {
    ctx.fillStyle = safeHouse.color;
    ctx.fillRect(
        safeHouse.x - safeHouse.size / 2,
        safeHouse.y - safeHouse.size / 2,
        safeHouse.size,
        safeHouse.size
    );

    // Little roof
    ctx.fillStyle = "#5d4037";
    ctx.beginPath();
    ctx.moveTo(safeHouse.x - safeHouse.size / 2, safeHouse.y - safeHouse.size / 2);
    ctx.lineTo(safeHouse.x + safeHouse.size / 2, safeHouse.y - safeHouse.size / 2);
    ctx.lineTo(safeHouse.x, safeHouse.y - safeHouse.size);
    ctx.closePath();
    ctx.fill();
}

// ----- Main game loop -----
function update() {
    handleKeyboardMovement();
    clampPlayer();
    moveCreeper();
    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, GAME_SIZE, GAME_SIZE);
    drawBackground();
    drawDecorations();
    drawSafeHouse();
    drawPlayer();
    drawCreeper();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
