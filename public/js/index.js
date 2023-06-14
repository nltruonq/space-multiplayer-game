const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const socket = io();

const scoreEl = document.querySelector("#scoreEl");

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = innerWidth * devicePixelRatio;
canvas.height = innerHeight * devicePixelRatio;

const x = canvas.width / 2;
const y = canvas.height / 2;

const urlParams = new URLSearchParams(window.location.search);
const nicknamePlayer = urlParams.get("nickname");

const frontEndPlayers = {};

socket.emit("nickname", { nickname: nicknamePlayer });

socket.on("updatePlayers", (backEndPlayers) => {
    for (const id in backEndPlayers) {
        const backEndPlayer = backEndPlayers[id];

        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({
                x: backEndPlayer.x,
                y: backEndPlayer.y,
                radius: 10,
                color: backEndPlayer.color,
                nickname: backEndPlayer.nickname,
            });
        } else {
            if (id === socket.id) {
                // if a player already exists
                frontEndPlayers[id].x = backEndPlayer.x;
                frontEndPlayers[id].y = backEndPlayer.y;
                frontEndPlayers[id].nickname = backEndPlayer.nickname;
                frontEndPlayers[id].died = backEndPlayer.died;

                const lastBackendInputIndex = playerInputs.findIndex((input) => {
                    return backEndPlayer.sequenceNumber === input.sequenceNumber;
                });

                if (lastBackendInputIndex > -1) playerInputs.splice(0, lastBackendInputIndex + 1);

                playerInputs.forEach((input) => {
                    frontEndPlayers[id].x += input.dx;
                    frontEndPlayers[id].y += input.dy;
                });
            } else {
                // for all other players
                frontEndPlayers[id].nickname = backEndPlayer.nickname;
                frontEndPlayers[id].angle = backEndPlayer.angle;
                frontEndPlayers[id].died = backEndPlayer.died;

                gsap.to(frontEndPlayers[id], {
                    x: backEndPlayer.x,
                    y: backEndPlayer.y,
                    duration: 0.015,
                    ease: "linear",
                });
            }
        }
    }

    for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
            delete frontEndPlayers[id];
        }
    }
});

socket.on("updateProjectiles", (projectiles) => {
    projectiles.forEach((e, i) => {
        projectilesFe.push(new Projectile(e));
    });
});

let animationId;
var projectilesFe = [];
var particles = [];
function animate() {
    animationId = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "rgba(0, 0, 0, 0.9)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    for (const id in frontEndPlayers) {
        const frontEndPlayer = frontEndPlayers[id];
        if (frontEndPlayer.died) frontEndPlayer.die();
        else frontEndPlayer.update();
    }

    projectilesFe.forEach((e, i, arr) => {
        for (const id in frontEndPlayers) {
            if (id === socket.id) {
                continue;
            }
            const frontEndPlayer = frontEndPlayers[id];
            const playerCenterX = frontEndPlayer.x + frontEndPlayer.width / 2;
            const playerCenterY = frontEndPlayer.y + frontEndPlayer.height / 2;
            const range = 10;
            if (
                e.x >= playerCenterX - range &&
                e.x <= playerCenterX + range &&
                e.y >= playerCenterY - range &&
                e.y <= playerCenterY + range
            ) {
                if (e.owner === socket.id) {
                    socket.emit("damage", { killer: e.owner, victim: id });
                    // create explosions
                    for (let i = 0; i < playerCenterX; i++) {
                        particles.push(
                            new Particle(e.x, e.y, Math.random() * 2, frontEndPlayer.color, {
                                x: (Math.random() - 0.5) * (Math.random() * 6),
                                y: (Math.random() - 0.5) * (Math.random() * 6),
                            })
                        );
                    }
                    document.querySelector("#scoreEl").innerText = parseInt(document.querySelector("#scoreEl").innerText) + 1;
                }
            }
        }
        if (e.x < 0 || e.x > canvas.width || e.y < 0 || e.y > canvas.height) {
            arr.splice(i, 1);
        }

        e.update();
    });

    for (let index = particles.length - 1; index >= 0; index--) {
        const particle = particles[index];

        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    }
}

animate();

const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
};

const SPEED = 10;
var playerInputs = [];
let sequenceNumber = 0;
setInterval(() => {
    if (!frontEndPlayers[socket.id]) return;
    if (keys.w.pressed && frontEndPlayers[socket.id].y > 10) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED });
        frontEndPlayers[socket.id].y -= SPEED;
        socket.emit("keydown", { keycode: "KeyW", sequenceNumber });
    }

    if (keys.a.pressed && frontEndPlayers[socket.id].x > 10) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 });
        frontEndPlayers[socket.id].x -= SPEED;
        socket.emit("keydown", { keycode: "KeyA", sequenceNumber });
    }

    if (keys.s.pressed && frontEndPlayers[socket.id].y < canvas.height - 60) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED });
        frontEndPlayers[socket.id].y += SPEED;
        socket.emit("keydown", { keycode: "KeyS", sequenceNumber });
    }

    if (keys.d.pressed && frontEndPlayers[socket.id].x < canvas.width - 60) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 });
        frontEndPlayers[socket.id].x += SPEED;
        socket.emit("keydown", { keycode: "KeyD", sequenceNumber });
    }
}, 15);

window.addEventListener("keydown", (event) => {
    if (!frontEndPlayers[socket.id]) return;

    switch (event.code) {
        case "KeyW":
            keys.w.pressed = true;
            break;

        case "KeyA":
            keys.a.pressed = true;
            break;

        case "KeyS":
            keys.s.pressed = true;
            break;

        case "KeyD":
            keys.d.pressed = true;
            break;
    }
});

window.addEventListener("keyup", (event) => {
    if (!frontEndPlayers[socket.id]) return;

    switch (event.code) {
        case "KeyW":
            keys.w.pressed = false;
            break;

        case "KeyA":
            keys.a.pressed = false;
            break;

        case "KeyS":
            keys.s.pressed = false;
            break;

        case "KeyD":
            keys.d.pressed = false;
            break;
    }
});

window.addEventListener("mousemove", handleCaculateAnglePlayer);

function handleCaculateAnglePlayer(event) {
    // Lấy tọa độ chuột trong canvas
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = event.clientX * devicePixelRatio - canvasRect.left;
    const mouseY = event.clientY * devicePixelRatio - canvasRect.top;

    // Tính toán góc xoay dựa trên tọa độ chuột
    const player = frontEndPlayers[socket.id];
    if (!player) return;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const dx = mouseX - playerCenterX;
    const dy = mouseY - playerCenterY;

    const angle = Math.atan2(dy, dx);

    if (angle !== player.angle) {
        player.angle = angle;
        socket.emit("mousemove", { id: socket.id, angle: angle });
    }
}

window.addEventListener("mousedown", handleShot);

let canShoot = true;
const projectileSpeed = 20;
function handleShot(event) {
    event.preventDefault();
    if (!canShoot) {
        return;
    }
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = event.clientX * devicePixelRatio - canvasRect.left;
    const mouseY = event.clientY * devicePixelRatio - canvasRect.top;

    const player = frontEndPlayers[socket.id];
    if (!player) return;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const dx = mouseX - playerCenterX;
    const dy = mouseY - playerCenterY;

    const angle = Math.atan2(dy, dx);
    const projectile = {
        x: playerCenterX + 20 * Math.cos(angle),
        y: playerCenterY + 20 * Math.sin(angle),
        radius: 3,
        color: player.color,
        velocity: {
            x: Math.cos(angle) * projectileSpeed,
            y: Math.sin(angle) * projectileSpeed,
        },
        owner: socket.id,
    };

    socket.emit("shot", { projectile });
    audio.shoot.play();
    canShoot = false;
    setTimeout(() => {
        canShoot = true;
    }, 100);
}

socket.on("damage", ({ killer, victim }) => {
    if (socket.id === victim) {
        audio.gameOver.play();
        document.querySelector(".modal-overlay").style.display = "block";
        document.querySelector(
            ".modal-header"
        ).innerHTML = `<h5 class="modal-title">Bạn đã bị tiêu diệt bởi <span style="color: red;">${frontEndPlayers[killer]?.nickname}</span></h5>`;
    }
});

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
    var touchStartX, touchStartY;
    const move = document.querySelector("#move");
    move.removeEventListener("mousedown", handleShot);
    move.addEventListener("touchstart", function (event) {
        console.log(event.touches);
        touchStartX = event.touches[0].clientX * devicePixelRatio;
        touchStartY = event.touches[0].clientY * devicePixelRatio;
    });
    move.addEventListener("touchend", function (event) {
        keys.w.pressed = false;
        keys.a.pressed = false;
        keys.s.pressed = false;
        keys.d.pressed = false;
    });
    move.addEventListener(
        "touchmove",
        function (event) {
            event.preventDefault(); // Ngăn chặn cuộn trang khi di chuyển trên màn hình

            const touchX = event.touches[0].clientX * devicePixelRatio;
            const touchY = event.touches[0].clientY * devicePixelRatio;

            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

            switch (true) {
                case deltaX === deltaY && deltaX === 0:
                    keys.w.pressed = false;
                    keys.a.pressed = false;
                    keys.s.pressed = false;
                    keys.d.pressed = false;
                    break;

                case angle > -112.5 && angle <= -67.5:
                    keys.s.pressed = false;
                    keys.w.pressed = true;
                    break;

                case angle > 157.5 && angle <= 202.5:
                    keys.d.pressed = false;
                    keys.a.pressed = true;
                    break;

                case angle > 67.5 && angle <= 112.5:
                    keys.w.pressed = false;
                    keys.s.pressed = true;
                    break;

                case angle > -22.5 && angle <= 22.5:
                    keys.a.pressed = false;
                    keys.d.pressed = true;
                    break;
            }

            touchStartX = touchX;
            touchStartY = touchY;
        },
        { passive: false }
    );
} else {
}
