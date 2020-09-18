class Dock {
    constructor(x, y, angle) {
        this.x = x;     // center of dock
        this.y = y;     // center of dock
        this.width = 40;
        this.height = 25;
        this.angle = angle;

        this.isDragging = false;
    }

    install() {
        for (var i = -this.width / 2; i <= this.width / 2; i++) {
            for (var j = -this.height / 2; j <= this.height / 2; j++) {
                var dock_x = Math.round(rotateX(i, j, 0, 0, this.angle) + this.x);
                var dock_y = Math.round(rotateY(i, j, 0, 0, this.angle) + this.y);
                obstacles[dock_x][dock_y] = true;
            }
        }
        this.draw(ctx_furn);
    }

    update(x, y, angle) {
        this.erase();
        this.x = x;
        this.y = y;
        this.angle = angle;

        // robot must be attached to the dock when the dock's position is updated.
        var y = this.y + this.height / 2;
        var x = rotateX(this.x, y, this.x, this.y, this.angle); // new x after rotating about center
        y = rotateY(this.x, y, this.x, this.y, this.angle); // new x after rotating about center
        robot.update(x, y, this.angle);

        this.draw(ctx);
    }

    erase() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    draw(layer) {
        layer.save();
        layer.translate(this.x, this.y); // Translate to centre of rectangle
        layer.rotate(this.angle);
        // Drawing of the dock
        layer.beginPath();
        layer.moveTo(-this.width / 2, this.height / 2); // lower left corner
        layer.lineTo(-this.width / 2, -this.height / 2); // upper left corner
        layer.lineTo(this.width / 2, -this.height / 2); // upper right corner
        layer.lineTo(this.width / 2, this.height / 2); // lower right corner
        layer.arc(0, this.height / 2, robot.radius, 0, Math.PI, true); // port for robot

        var grd = layer.createLinearGradient(0, 0, this.width, 0);
        grd.addColorStop(0, "black");
        grd.addColorStop(1, "white");
        layer.fillStyle = grd;
        layer.fill();
        layer.restore();
    }

    mouseDown(e) {
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        // calculate the current mouse position
        var mx = parseInt(e.clientX - offset.x);
        var my = parseInt(e.clientY - offset.y);
        var m = new Point(mx, my);

        // math test to see if mouse is inside rectangle of dock
        var left = this.x - this.width / 2;
        var right = this.x + this.width / 2;
        var bottom = this.y - this.height / 2;
        var top = this.y + this.height / 2;

        var p1 = new Point(left, top);
        var p2 = new Point(right, top);
        var p3 = new Point(right, bottom);
        var p4 = new Point(left, bottom);

        var rectangle = {
            A: rotate(p1, this.x, this.y, this.angle),
            B: rotate(p2, this.x, this.y, this.angle),
            C: rotate(p3, this.x, this.y, this.angle),
            D: rotate(p4, this.x, this.y, this.angle)
        }
        
        if (pointInRectangle(m, rectangle)) {
            this.isDragging = true;
            return;
        }

        // math test to see if mouse is inside the robot cleaner
        var dx = mx - robot.x;
        var dy = my - robot.y;
        if (dx * dx + dy * dy < robot.radius * robot.radius) {
            this.isDragging = true;
            return;
        }
    }

    mouseMove(e) {
        // return if we're not dragging
        if (!this.isDragging) { return; }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        // calculate the current mouse position         
        var mouseX = parseInt(e.clientX - offset.x);
        var mouseY = parseInt(e.clientY - offset.y);

        var p = house.placeDock(mouseX, mouseY);
        this.update(p.x, p.y, p.angle);
    }

    mouseUp(e) {
        // return if we're not dragging
        if (!this.isDragging) { return; }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        // the drag is over -- clear the isDragging flag
        this.isDragging = false;
    }

    mouseOut(e) {
        this.mouseUp(e);  // same case as mouseUp
    }
}