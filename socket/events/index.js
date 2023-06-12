const event = (socket, io, backEndPlayers, projectiles, SPEED) => {
    require("./player/player.event")(socket, io, backEndPlayers, projectiles, SPEED);
};

module.exports = event;
