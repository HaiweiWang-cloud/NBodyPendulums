const MS = 0.001 // number of seconds in a millisecond

class PointMass extends Point {
    constructor(x, y) {
        super(x, y);

        this.vx = 0;
        this.vy = 0;

        this.mass = 1;
        this.gravity = 100;
    }

    update(deltaTime) {
        this.vy += this.gravity * deltaTime * MS;

        this.x += this.vx * deltaTime * MS;
        this.y += this.vy * deltaTime * MS;
    }
}