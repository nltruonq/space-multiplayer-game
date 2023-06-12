const { Server } = require("socket.io");
const event = require("./events/index");

module.exports = (server) => {
    const backEndPlayers = {};
    const projectiles = [];
    const SPEED = 10;

    const io = new Server(server, {
        pingInterval: 2000,
        pingTimeout: 5000,
    });

    io.on("connection", (socket) => {
        console.log("A client connected with id ", socket.id);
        backEndPlayers[socket.id] = {
            x: 500 * Math.random(),
            y: 500 * Math.random(),
            color: `hsl(${360 * Math.random()}, 100%, 50%)`,
            sequenceNumber: 0,
            nickname: socket.nickname,
            kill: 0,
            angle: 0,
        };

        io.emit("updatePlayers", backEndPlayers);

        event(socket, io, backEndPlayers, projectiles, SPEED);

        socket.on("disconnect", (reason) => {
            console.log(reason, socket.nickname);
            delete backEndPlayers[socket.id];
            io.emit("updatePlayers", backEndPlayers);
        });
    });
    setInterval(() => {
        io.emit("updatePlayers", backEndPlayers);
        io.emit("updateProjectiles", projectiles);
        projectiles.splice(0, projectiles.length);
    }, 15);
};
