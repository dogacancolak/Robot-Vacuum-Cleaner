
class FurnitureOptionBar {
    constructor() {
        this.corner_radius = 40;
        this.height = 100;
        this.width = canvas.width;

        this.sofa = new Sofa(this.width / 4, this.height / 2, 0); // between first and second quadrants on bar
        this.chair = new Chair(this.width / 2, this.height / 2, 0); // between second and third quadrants
        this.bed = new Bed(this.width * 3 / 4, this.height / 2, 0); // between third and fourth quadrants
    }

    setup() {
        var buttons = document.getElementsByClassName("furniture-button");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].style.display = "none";
        }
        document.getElementById("next").style.display = "inline-block";
        this.sofa.update(this.width / 4, this.height / 2, 0);
        this.chair.update(this.width / 2, this.height / 2, 0);
        this.bed.update(this.width * 3 / 4, this.height / 2, 0);
        this.draw();
        canvas.onmousedown = this.mouseDown.bind(this);
        canvas.onmousemove = null;
        canvas.onmouseout  = null;
        canvas.onmouseup   = null;
    }

    finalize() {
        document.getElementById("next").style.display = "none";
        document.getElementById("start").style.display = "inline-block";

        this.erase();

        var p = house.placeDock(canvas.width / 2, canvas.height / 2, 0); // place dock close to the center of the canvas
        if (!p) {
            house.reset();
            return;
        }
        dock.update(p.x, p.y, p.angle);

        canvas.onmousedown = dock.mouseDown.bind(dock);
        canvas.onmousemove = dock.mouseMove.bind(dock);
        canvas.onmouseout  = dock.mouseOut.bind(dock);
        canvas.onmouseup   = dock.mouseUp.bind(dock);
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width, this.height - this.corner_radius);
        ctx.arcTo(this.width, this.height, this.width - this.corner_radius, this.height, this.corner_radius);
        ctx.lineTo(this.corner_radius, this.height);
        ctx.arcTo(0, this.height, 0, this.height - this.corner_radius, this.corner_radius);
        ctx.closePath();

        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgb(70,70,70)";
        ctx.fillStyle = "rgba(169,169,169,0.8)";
        ctx.stroke();
        ctx.fill();

        this.sofa.draw(ctx);
        this.chair.draw(ctx);
        this.bed.draw(ctx);
    }

    erase() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    mouseDown(e) {
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        var furniture;
        if (this.sofa.isClicked(e)) {
            furniture = this.sofa;
        }
        else if (this.chair.isClicked(e)) {
            furniture = this.chair;
        }
        else if (this.bed.isClicked(e)) {
            furniture = this.bed;
        }
        else {
            return;
        }
        this.erase();
        this.selected = furniture;
        furniture.bindToMouse();

        var buttons = document.getElementsByClassName("furniture-button");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].style.display = "inline-block";
        }
        document.getElementById("next").style.display = "none";
    }
}

class Furniture {
    constructor(x, y, angle, img) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.img = img;

        var scale = 0.1;
        this.width = img.width * scale;
        this.height = img.height * scale;
    }

    rotate() {
        this.update(this.x, this.y, this.angle + Math.PI / 6);
    }

    update(x, y, angle) {
        this.erase();
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.draw(ctx);
    }

    bindToMouse() {
        canvas.onmousedown = this.mouseDown.bind(this);
        canvas.onmousemove = this.mouseMove.bind(this);

        this.update(this.x, this.y, this.angle);
    }

    erase() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    draw(layer) {
        layer.save();
        layer.translate(this.x, this.y);
        layer.rotate(this.angle);
        layer.drawImage(this.img, 0, 0, this.img.width, this.img.height, 
                                  -this.width / 2, -this.height / 2, this.width, this.height);

        layer.restore();
    }

    mouseDown(e) {
        var points = this.traverse();
        var isPlaceable = (p) => !obstacles[p.x][p.y];
        var place = (p) => { obstacles[p.x][p.y] = true; };
        if (points.every(isPlaceable)) {
            this.draw(ctx_furn);
            points.forEach(place);
            furniture_options.setup();
        }
    }

    mouseMove(e) {
        // calculate the current mouse position
        var mx = parseInt(e.clientX - offset.x);
        var my = parseInt(e.clientY - offset.y);

        this.update(mx, my, this.angle);
    }
}

class Sofa extends Furniture {
    constructor(x, y, angle) {
        var img = new Image();
        img.src = "graphics/sofa.png";

        super(x, y, angle, img);
    }

    isClicked(e) {
        // calculate the current mouse position
        var mx = parseInt(e.clientX - offset.x);
        var my = parseInt(e.clientY - offset.y);
        var m  = new Point(mx, my);

        function generateRectangle(left, right, bottom, top, sofa) {
            var p1 = new Point(left, top);
            var p2 = new Point(right, top);
            var p3 = new Point(right, bottom);
            var p4 = new Point(left, bottom);      
                
            return {
                A: rotate(p1, sofa.x, sofa.y, sofa.angle),
                B: rotate(p2, sofa.x, sofa.y, sofa.angle),
                C: rotate(p3, sofa.x, sofa.y, sofa.angle),
                D: rotate(p4, sofa.x, sofa.y, sofa.angle)
            }
        }

        // lower rectangle (long edge of the "L" shape)
        var left = this.x - this.width / 2;
        var right = this.x + this.width / 2;
        var bottom = this.y + this.height / 2;
        var top = this.y;

        var r1 = generateRectangle(left, right, bottom, top, this);

        // upper rectangle (long edge of the "L" shape)
        left = this.x + this.width / 4;         
        bottom = this.y;
        top = this.y - this.height / 2;

        var r2 = generateRectangle(left, right, bottom, top, this);

        return pointInRectangle(m, r1) || pointInRectangle(m, r2);
    }

    traverse() {
        var points = [];

        for (var i = -this.width / 2; i <= this.width / 2; i++) {
            for (var j = 0; j <= this.height / 2; j++) {
                var x = Math.round(rotateX(i, j, 0, 0, this.angle) + this.x);
                var y = Math.round(rotateY(i, j, 0, 0, this.angle) + this.y);
                points.push( {x: x, y: y} );
            }
        }

        for (var i = this.width / 4; i <= this.width / 2; i++) {
            for (var j = -this.height / 2; j <= 0; j++) {
                var x = Math.round(rotateX(i, j, 0, 0, this.angle) + this.x);
                var y = Math.round(rotateY(i, j, 0, 0, this.angle) + this.y);
                points.push( {x: x, y: y} );
            }
        }

        return points;
    }
}

class Chair extends Furniture {
    constructor(x, y, angle) {
        var img = new Image();
        img.src = "graphics/chair.png";

        super(x, y, angle, img);
    }

    // check if point (x, y) is in the area of the chair 
    inCircle(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        var radius = this.width / 2;
        return (dx * dx + dy * dy < radius * radius);
    }

    isClicked(e) {
        // calculate the current mouse position
        var mx = parseInt(e.clientX - offset.x);
        var my = parseInt(e.clientY - offset.y);

        return this.inCircle(mx, my);
    }

    traverse() {
        var points = [];

        for (var i = -this.width / 2; i <= this.width / 2; i++) {
            for (var j = -this.height / 2; j <= this.height / 2; j++) {
                var x = Math.round(rotateX(i, j, 0, 0, this.angle) + this.x);
                var y = Math.round(rotateY(i, j, 0, 0, this.angle) + this.y);
                if (this.inCircle(x, y)) {
                    points.push( {x: x, y: y} );
                }
            }
        }
        return points;
    }
}

class Bed extends Furniture {
    constructor(x, y, angle) {
        var img = new Image();
        img.src = "graphics/bed.png";

        super(x, y, angle, img);
    }

    isClicked(e) {
        // calculate the current mouse position
        var mx = parseInt(e.clientX - offset.x);
        var my = parseInt(e.clientY - offset.y);
        var m  = new Point(mx, my);

        var left   = this.x - this.width / 2;
        var right  = this.x + this.width / 2;
        var top    = this.y - this.height / 2;
        var bottom = this.y + this.height / 2;

        var p1 = new Point(left, top);
        var p2 = new Point(right, top);
        var p3 = new Point(right, bottom);
        var p4 = new Point(left, bottom);      
            
        var r = {
            A: rotate(p1, this.x, this.y, this.angle),
            B: rotate(p2, this.x, this.y, this.angle),
            C: rotate(p3, this.x, this.y, this.angle),
            D: rotate(p4, this.x, this.y, this.angle)
        }

        return pointInRectangle(m, r);
    }

    traverse() {
        var points = [];

        for (var i = -this.width / 2; i <= this.width / 2; i++) {
            for (var j = -this.height / 2; j <= this.height / 2; j++) {
                var x = Math.round(rotateX(i, j, 0, 0, this.angle) + this.x);
                var y = Math.round(rotateY(i, j, 0, 0, this.angle) + this.y);
                points.push( {x: x, y: y} );
            }
        }
        return points;
    }
}