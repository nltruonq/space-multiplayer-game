Howler.volume(0.2);
const audio = {
    bomb: new Howl({
        src: "../audio/bomb.mp3",
    }),
    bonus: new Howl({
        src: "../audio/bonus.mp3",
        volume: 0.8,
    }),
    gameOver: new Howl({
        src: "../audio/gameOver.mp3",
    }),
    shoot: new Howl({
        src: "../audio/shoot.wav",
    }),
    start: new Howl({
        src: "../audio/start.mp3",
    }),
};
