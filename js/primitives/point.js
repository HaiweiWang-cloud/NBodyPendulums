class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static add(p1, p2) {
        return new Point(p1.x + p2.x, p1.y + p2.y);
    }

    static subtract(p1, p2) {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }

    static scale(p, scalar) {
        return new Point(p1.x * scalar, p1.y * scalar);
    }

    equals(point) {
        return this.x === point.x && this.y === point.y;
    }

    moveTo(point) {
        this.x = point.x;
        this.y = point.y;
    }

    draw(ctx, { color="white", size=2, fill=true } = {}) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
}