class Rod extends Segment {
    // A rod is a segment with fixed length

    constructor(p1, p2) {
        super(p1, p2);

        this.calculateRodLength();

        this.p1Attached = false;
        this.p2Attached = false;
        this.fixedPoint = null;
    }

    calculateRodLength() {
        this.l = distance(this.p1, this.p2);
    }

    attachMass(mass) {
        if (mass instanceof PointMass && !this.containsPoint(mass)) {
            if (distance(this.p1, mass) < distance(this.p2, mass)) {
                this.p1 = mass;
                this.p1Attached = true;
                
            } else {
                this.p2 = mass;
                this.p2Attached = true;
            }
            this.calculateRodLength();
        }
    }

    detachMass(mass, {breakMinOffset = 20, breakRange = 20} = {}) {
        const offsetX = (1 - 2*Math.round(Math.random())) * (Math.random() * breakRange + breakMinOffset);
        const offsetY = (1 - 2*Math.round(Math.random())) * (Math.random() * breakRange + breakMinOffset);
        if (mass instanceof PointMass) {
            if (mass === this.p1) {
                this.p1 = new Point(mass.x + offsetX, mass.y + offsetY);
                this.p1Attached = false;
            } else if (mass === this.p2) {
                this.p2 = new Point(mass.x + offsetX, mass.y + offsetY);
                this.p2Attached = false;
            }
        }
    }

    applyConstraint() {
        const d = distance(this.p1, this.p2);
        if (this.p1Attached && this.p2Attached) {
            const w1 = 1 / this.p1.mass;
            const w2 = 1 / this.p2.mass;

            this.p1.x += w1 / (w1 + w2) * (this.p2.x - this.p1.x) * (d - this.l) / d;
            this.p2.x += -w2 / (w1 + w2) * (this.p2.x - this.p1.x) * (d - this.l) / d;
            this.p1.y += w1 / (w1 + w2) * (this.p2.y - this.p1.y) * (d - this.l) / d;
            this.p2.y += -w2 / (w1 + w2) * (this.p2.y - this.p1.y) * (d - this.l) / d;
        } else if (this.p1Attached && !this.p2Attached) {
            this.p1.x += (this.p2.x - this.p1.x) * (d - this.l) / d;
            this.p1.y += (this.p2.y - this.p1.y) * (d - this.l) / d;
        } else if (!this.p1Attached && this.p2Attached) {
            this.p2.x += -(this.p2.x - this.p1.x) * (d - this.l) / d;
            this.p2.y += -(this.p2.y - this.p1.y) * (d - this.l) / d;
        }
    }
}