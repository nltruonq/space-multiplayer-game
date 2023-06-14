class Player {
    constructor({ x, y, radius, color, nickname }) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.radius = radius;
        this.color = color;
        this.nickname = nickname;

        const image = new Image();
        image.src = "../../img/ship.png";
        image.onload = () => {
            const scale = 1;

            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
        };
    }

    draw() {
        c.save();

        const playerCenterX = this.x + this.width / 2;
        const playerCenterY = this.y + this.height / 2;

        c.translate(playerCenterX, playerCenterY);
        c.rotate(this.angle + Math.PI / 2);
        c.translate(-playerCenterX, -playerCenterY);
        c.drawImage(this.image, this.x, this.y);

        c.font = "16px Arial";
        c.fillStyle = this.color;
        c.textAlign = "center";
        c.fillText(this.nickname, this.x + this.width / 2, this.y - window.devicePixelRatio - 5);
        c.fill();

        c.restore();
    }

    update() {
        if (!this.image) return;
        this.draw();
    }

    die() {
        while (this.radius > 0) {
            c.beginPath();
            c.arc(this.x + this.width / 2, this.y + this.height / 2, this.radius, 0, Math.PI * 2, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath();
            this.radius -= 1;
        }
    }
}
