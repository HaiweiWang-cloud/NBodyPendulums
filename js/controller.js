class Controller {
    constructor(canvas, massInput) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.masses = [];
        this.rods =[];

        this.gravity = 50;
        this.drag = 0;
        this.massInput = massInput;
        
        this.#setInitialState();
        
        this.#addEventListeners();
    }

    update(dt, substeps = 200) {
        const deltaTime = dt/substeps;
        for (let i=0; i<substeps; i++) {
            if (!this.paused && deltaTime > 0) {
                // Store positions for later computations
                const oldX = this.masses.map(mass => mass.x);
                const oldY = this.masses.map(mass => mass.y);

                // Update without constraints
                this.masses.forEach(mass => {
                    mass.vy += (this.gravity - mass.vy * this.drag) * deltaTime * MS ;
                    mass.vx += -mass.vx * this.drag * deltaTime * MS;
                    mass.update(deltaTime);
                });
    
                // Apply fixed distance constraints
                this.rods.forEach(rod => {
                    rod.applyConstraint();
                })
    
                // Recalculate velocity based on applied constraints
                if (!this.dragging) {
                    let index = 0;
                    for (const mass of this.masses) {
                        mass.vx = (mass.x - oldX[index]) / deltaTime * 1000;
                        mass.vy = (mass.y - oldY[index]) / deltaTime * 1000;
                        index++;
                    }
                }
            }
        }
    }

    // Methods

    load(info) {
        const masses = [];
        const rods = [];
        for (const massInfo of info.masses) {
            const mass = new PointMass(massInfo.x, massInfo.y);
            mass.mass = massInfo.mass;
            masses.push(mass)
        }

        for (const rodInfo of info.rods) {
            
            const rod = new Rod(new Point(rodInfo.p1.x, rodInfo.p1.y), new Point(rodInfo.p2.x, rodInfo.p2.y));
            
            // find the attached masses based on proximity and reattach them
            masses.forEach(mass => {
                let attachmentPoint = rod.getOverlappingPoint(mass)
                if (attachmentPoint) {
                    rod.attachMass(mass);
                }
            });
            rods.push(rod);
        }
        this.#setInitialState();
        this.masses = masses;
        this.rods = rods;
    }

    dispose() {
        this.masses.length = 0;
        this.rods.length = 0;
        this.#setInitialState();
    }

    pause() {
        this.paused = this.paused ? false : true;
    }
    
    addPointMass() {
        this.masses.push(new PointMass(this.canvas.width / 2, this.canvas.height / 2));
    }

    addRod() {
        const length = 200
        this.rods.push(new Rod(
            new Point(this.canvas.width/2 - length / 2, this.canvas.height / 2),
            new Point(this.canvas.width/2 + length / 2, this.canvas.height / 2)
        ));
    }

    draw() {
        this.masses.forEach(mass => {
            mass.draw(this.ctx, {color:  "rgb(132, 203, 253)", size: 12, scaleWithMass: true});
        });

        this.rods.forEach(rod => {
            rod.draw(this.ctx, {color: "gray", lineWidth: 8});
        });

        // Draw hierarchy: point over line, selected over hovered.

        if (this.hoveredRod) {
            this.hoveredRod.draw(this.ctx, {color: "green", lineWidth: 8});
        }

        if (this.hovered) {
            this.hovered.draw(this.ctx, {color: "green", size: 6});
        }

        if (this.selectedRod) {
            this.selectedRod.draw(this.ctx, {color: "yellow", lineWidth: 8});
        }

        if (this.selected) {
            this.selected.draw(this.ctx, {color: "yellow", size: 6});
        }
    }

    // Private methods

    #setInitialState() {
        this.paused = true;
        this.mouse = null;
        this.hovered = null;
        this.hoveredRod = null;
        this.selected = null;
        this.selectedRod = null;
        this.snapped = null;
        this.dragging = false;
        this.dragInitialDelta1 = null;
        this.dragInitialDelta2 = null;
    }

    #updateMassEditor() {
        if (this.massInput) {
            if (this.selected) {
                if (this.#isMass(this.selected)) {
                    this.massInput.disabled = false;
                    this.massInput.value = this.selected.mass;
                    return;
                }
            }
            this.massInput.disabled = true;
            this.massInput.value = "";
        }
    }

    #detachAllAttachedRods(mass) {
        const rodsToDetach = this.#findParentRods(mass);
        rodsToDetach.forEach((rod) => rod.detachMass(mass));
    }

    #deleteRod(rod) {
        this.rods.splice(this.rods.indexOf(rod), 1);
    }

    #deleteMass(mass) {
        this.#detachAllAttachedRods(mass);
        this.masses.splice(this.masses.indexOf(mass), 1);
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousemove", this.#mouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.#mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.#mouseUp.bind(this));
        window.addEventListener("keydown", this.#handleKeyDown.bind(this));
        this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());
    }

    #handleKeyDown(evt) {
        if (evt.key == "Delete") {
            if (this.selected || this.selectedRod) {
                if (this.#isMass(this.selected)) {
                    this.#deleteMass(this.selected);
                    this.selected = null;
                    this.hovered = null;
                } else if (this.selectedRod) {
                    this.#deleteRod(this.selectedRod);
                    this.selectedRod = null;
                    this.hoveredRod = null;
                }
            }
        } else {
            this.pause();
        }
    }

    #mouseMove(evt) {
        const rodPoints = [...this.rods.map(rod => rod.p1), ...this.rods.map(rod => rod.p2)];
        this.mouse = new Point(evt.offsetX, evt.offsetY);
        this.hovered = getNearestPoint(this.mouse,
            [...this.masses, ...rodPoints], 
            10);
        
        // Selecting points take precedence over selecting rods.
        if (!this.hovered) {
            this.hoveredRod = getNearestSegment(this.mouse, this.rods, 10);
        } else {
            this.hoveredRod = null;
        }
        
        // Dragging behaviour
        if (this.dragging) {
            if (this.selected) {
                // Move points if not snapping to other objects, otherwise snap to other viable objects.
                this.selected.moveTo(this.mouse);

                // If it is a mass, snap to points that are rods.
                if (this.#isMass(this.selected)) {
                    this.#tryStopMass(this.selected);
                    this.snapped = getNearestPoint(this.selected, rodPoints, 15);
                } else {
                    this.snapped = getNearestPoint(this.selected, this.masses, 15);
                }

                if (this.snapped) {
                    this.selected.moveTo(this.snapped);
                }
            }

            // Move rods
            if (this.selectedRod) {
                this.selectedRod.p1.moveTo(Point.add(this.dragInitialDelta1, this.mouse));
                this.selectedRod.p2.moveTo(Point.add(this.dragInitialDelta2, this.mouse));
                
                this.#tryStopMass(this.selectedRod.p1);
                this.#tryStopMass(this.selectedRod.p2);
            }

            
        }
    }

    #mouseDown(evt) {
        if (evt.button == 0) {
            this.selected = this.hovered;
            this.selectedRod = this.hoveredRod;
            this.dragging = true;
            this.dragStartPoint = new Point(this.mouse.x, this.mouse.y);

            this.#updateMassEditor();
            
            if (this.selectedRod) {
                this.dragInitialDelta1 = Point.subtract(this.selectedRod.p1, this.mouse);
                this.dragInitialDelta2 = Point.subtract(this.selectedRod.p2, this.mouse);
            }
        }

        if (evt.button == 2) {
            if (this.#isMass(this.hovered)) {
                this.#detachAllAttachedRods(this.hovered);
            }
        }
    }

    #mouseUp(evt) {
        this.dragging = false;

        if (this.snapped) {
            // If snapped to object is a mass, attach it to the rod, if snapped to object is the end of a rod, attach the selected mass to the end of the rod.
            if (this.#isMass(this.snapped)) {
                const rodToAttach = this.#findParentRods(this.selected)[0];
                rodToAttach.attachMass(this.snapped);
            } else {
                const rodToAttach = this.#findParentRods(this.snapped)[0];
                rodToAttach.attachMass(this.selected);
            }
            this.selected = null;
            this.snapped = null;
        }

        if (this.paused) {
            for (const rod of this.rods) {
                rod.calculateRodLength();
            }
        }
    }

    // Helper methods

    #tryStopMass(mass) {
        if (this.#isMass(mass)) {
            mass.vx = 0;
            mass.vy = 0;
        }
    }

    #isMass(point) {
        return point instanceof PointMass;
    }

    #findParentRods(point) {
        const parentRods = [];
        for (const rod of this.rods) {
            if (rod.containsPoint(point)) {
                parentRods.push(rod);
            }
        }

        return parentRods;
    }
}