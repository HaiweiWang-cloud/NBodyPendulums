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
}