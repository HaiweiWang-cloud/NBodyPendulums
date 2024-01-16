const MS = 0.001 // number of seconds in a millisecond

class PointMass extends Point {
    constructor(x, y) {
        super(x, y);

        this.vx = 0;
        this.vy = 0;

        this.mass = 1;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime * MS;
        this.y += this.vy * deltaTime * MS;
    }

    freeze() {
        this.vx = 0;
        this.vy = 0;
    }

    draw(ctx, { color="white", size=1, scaleWithMass=false} = {}) {
        const sizeConst = size;
        if (scaleWithMass) {
            super.draw(ctx, { color: color, size: Math.max(sizeConst, Math.min(this.mass + sizeConst, sizeConst * 3))})
        }
        super.draw(ctx, { color: color, size: sizeConst})
    }
}