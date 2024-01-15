class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    getLength() {
        return distance(this.p1, this.p2);
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