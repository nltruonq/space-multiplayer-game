const Projectile = require("../../../public/js/classes/Projectile");

const playerEvent = (socket, io, backEndPlayers, projectiles, SPEED) => {
    socket.on("keydown", ({ keycode, sequenceNumber }) => {
        if (!backEndPlayers[socket.id]) return;
        backEndPlayers[socket.id].sequenceNumber = sequenceNumber;
        switch (keycode) {
            case "KeyW":
                backEndPlayers[socket.id].y -= SPEED;
                break;

            case "KeyA":
                backEndPlayers[socket.id].x -= SPEED;
                break;

            case "KeyS":
                backEndPlayers[socket.id].y += SPEED;
                break;

            case "KeyD":
                backEndPlayers[socket.id].x += SPEED;
                break;
        }
    });

    socket.on("nickname", ({ nickname }) => {
        socket.nickname = nickname;
        backEndPlayers[socket.id].nickname = nickname;
    });

    socket.on("mousemove", ({ id, angle }) => {
        if (!backEndPlayers[id]) return;
        backEndPlayers[id].angle = angle;
    });

    socket.on("shot", ({ projectile }) => {
        projectiles.push(projectile);
    });

    socket.on("damage", ({ killer, victim }) => {
        delete backEndPlayers[victim];
        if (!backEndPlayers[killer]) return;
        backEndPlayers[killer].kill += 1;
        io.emit("damage", { killer, victim });
    });
};

module.exports = playerEvent;
