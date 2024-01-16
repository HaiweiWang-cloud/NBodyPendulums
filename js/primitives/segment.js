class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    getLength() {
        return distance(this.p1, this.p2);
    }

    containsPoint(point) {
        if (point === this.p1 || point === this.p2) {
            return true;
        } else {
            return false;
        }
    }

    getPoint(point) { 
        if (point === this.p1) {
            return this.p1;
        } else if (point === this.p2) {
            return this.p2;
        } else {
            return null;
        }
    }

    getOverlappingPoint(point) {
        if (point.equals(this.p1)) {
            return this.p1;
        } else if (point.equals(this.p2)) {
            return this.p2;
        } else {
            return null;
        }
    }

    draw(ctx, {color="white", lineWidth=6}={}) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.p1.x, this.p1.y, lineWidth / 2, 0, 2 * Math.PI);
        ctx.arc(this.p2.x, this.p2.y, lineWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.arc(this.p1.x, this.p1.y, lineWidth / 4, 0, 2 * Math.PI);
        ctx.arc(this.p2.x, this.p2.y, lineWidth / 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}