class Robot {
    constructor(x, y) {
        this.radius = 20;
        this.x = x;
        this.y = y;
        this.angle = 0;
    }

    leaveTrace() {
        ctx_trace.save();
        ctx_trace.translate(this.x, this.y); // Translate to centre of circle
        ctx_trace.rotate(this.angle);
        ctx_trace.beginPath();
        ctx_trace.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx_trace.clip();
        ctx_trace.clearRect(-canvas.width, -canvas.height, 2 * canvas.width, 2 * canvas.height);

        // ctx_trace.save();
        // ctx_trace.translate(this.x, this.y); // Translate to centre of circle
        // ctx_trace.rotate(this.angle);
        // ctx_trace.beginPath();
        // ctx_trace.arc(0, 0, this.radius, 0, 2 * Math.PI);
        
        // ctx_trace.fillStyle = 'rgba(0, 0, 255, 0.008)';
        // ctx_trace.fill();
        ctx_trace.restore();
    }

    // returns if the chosen part of the bumper has collided, where start and end are the x-coordinates of the part
    didPartCollide(start, end) {
        var p = this.x; // center of robot's angle is itself
        var q = this.y;
        var r = this.radius + 1; // radius of detector is one pixel longer 

        for (var i = start; i < end + 1; i++) { // loop the integer x-values of a semicircle about (0,0)
            var x = i + this.x; // x that's centered about robot
            var y = Math.sqrt(r * r - i * i) + this.y; // find the y centered around robot

            var x_rotated = Math.round(rotateX(x, y, p, q, this.angle)); // new x after rotating about (p, q)
            var y_rotated = Math.round(rotateY(x, y, p, q, this.angle)); // new y after rotating about (p, q)

            if (obstacles[x_rotated][y_rotated]) { return true; }
        }
        return false;
    }

    leftCollide() {
        return this.didPartCollide(0, this.radius);
    }

    rightCollide() {
        return this.didPartCollide(-this.radius, 0);
    }

    advance() {
        // erase old position
        this.erase();

        var x = this.x; // keep the x position
        var y = this.y + 1; // advance in the y direction 'units' pixels.
        var p = this.x; // center of robot's angle is itself
        var q = this.y;
        robot.x = rotateX(x, y, p, q, this.angle); // new x after rotating about (p, q)
        robot.y = rotateY(x, y, p, q, this.angle); // new y after rotating about (p, q)

        // draw new position
        this.draw();
        this.leaveTrace();
    }

    steerRight() {
        this.erase();
        this.angle += Math.PI / 180;
        this.draw();
    }

    steerLeft() {
        this.erase();
        this.angle -= Math.PI / 180;
        this.draw();
    }

    update(x, y, angle) {
        this.erase();
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.draw();
    }

    erase() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y); // Translate to centre of circle
        ctx.rotate(this.angle);
        ctx.drawImage(robot_img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        ctx.restore();
    }
}