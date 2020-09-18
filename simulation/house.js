class House {
    constructor() {
        this.currentlyDrawing = false;
    }

    storeCoordinate(point) {
        this.vertices.push({ x: point.x, y: point.y });
    }

    reset() {
        this.setup();
        alert("There is not enough space for the robot. Please draw again.");
    }

    setup() {
        this.vertices = [];

        for (var i = 0; i < canvas.width; i++) {
            for (var j = 0; j < canvas.height; j++) {
                obstacles[i][j] = false;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx_back.clearRect(0, 0, canvas.width, canvas.height);
        ctx_walls.clearRect(0, 0, canvas.width, canvas.height);
        ctx_furn.clearRect(0, 0, canvas.width, canvas.height);
        ctx_trace.clearRect(0, 0, canvas.width, canvas.height);

        ctx_back.drawImage(lawn, 0, 0, lawn.width, lawn.height, 0, 0, canvas.width, canvas.height);

        // listen for mouse events (wall building)
        canvas.onmousedown = house.mouseDown.bind(house);
        canvas.onmousemove = house.mouseMove.bind(house);
        canvas.onmouseout = house.mouseOut.bind(house);
    }

    drawFloor() {
        var temp = this;
        function draw(layer) {
            layer.beginPath();
            layer.moveTo(temp.vertices[0].x, temp.vertices[0].y);
            for (var i = 1; i < temp.vertices.length; i++) { // follow the perimeter of house and clip it
                var x = temp.vertices[i].x;
                var y = temp.vertices[i].y;
                layer.lineTo(x, y);
            }
            layer.save();
            layer.clip();
            layer.drawImage(floor, 0, 0, background.width, background.height);   // put image over clipped area
        }

        draw(ctx_back);
        draw(ctx_trace);

        ctx_back.fillStyle = 'rgba(0, 0, 255, 0.2)';
        ctx_back.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx_back.restore();
        ctx_trace.restore();
    }

    drawWall(layer, p1, p2) {
        var width = wall.width / wall_scale;
        var height = wall.height / wall_scale;
        var dy = p2.y - p1.y;
        var dx = p2.x - p1.x;
        var distance = Math.sqrt(dy * dy + dx * dx);
        var slope = nonzeroDivide(dy, dx); // find slope of wall
        var theta = Math.atan2(dy, dx); // angle of wall

        while (distance >= 0) {
            layer.save();
            layer.translate(p1.x, p1.y); // Translate to endpoint of wall
            layer.rotate(theta);

            var length = (distance < width) ? distance : width;
            layer.drawImage(wall, 0, 0, length * wall_scale, wall.height, 0, -height / 2, length, height);

            p1 = getOtherPoint(p1, p2, width, slope);
            distance -= width;
            layer.restore();
        }
    }

    buildWall(p2) {
        // position of last corner selected
        var x1 = this.vertices[this.vertices.length - 1].x;
        var y1 = this.vertices[this.vertices.length - 1].y;
        var p1 = new Point(x1, y1);

        // store new corner
        this.storeCoordinate(p2);

        this.drawWall(ctx_walls, p1, p2);
    }

    wallsIntersect(x1, y1) {
        var x2 = this.vertices[this.vertices.length - 1].x;
        var y2 = this.vertices[this.vertices.length - 1].y;

        // if the two endpoints of the wall is the same
        if (x1 == x2 && y1 == y2) { return true; }

        for (var i = 0; i < this.vertices.length - 2; i++) {
            var x3 = this.vertices[i].x;
            var y3 = this.vertices[i].y;
            var x4 = this.vertices[i + 1].x;
            var y4 = this.vertices[i + 1].y;

            if (linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) { return true; }
        }
        return false;
    }

    isDockable(x, y, angle) {
        var wall_height = wall.height / wall_scale;
        var offset = wall_height / 2;
        var bottom_offset = offset + 1;
        var top_offset    = bottom_offset + dock.height + 2 * robot.radius;

        for (var i = -dock.width / 2; i <= dock.width / 2; i++) {
            for (var j = bottom_offset; j <= top_offset; j++) {     
                var dock_x = Math.round(rotateX(i, j, 0, 0, angle) + x);
                var dock_y = Math.round(rotateY(i, j, 0, 0, angle) + y);
                if (obstacles[dock_x][dock_y]) { return false; }    // in front of the wall must be a clearing
            }
            for (var j = offset - 1; j > 0; j--) {   // behind
                var dock_x = Math.round(rotateX(i, j, 0, 0, angle) + x);
                var dock_y = Math.round(rotateY(i, j, 0, 0, angle) + y);
                if (!obstacles[dock_x][dock_y]) { return false; }  // behind the point must be completely walls.
            }
        }
        var new_x = rotateX(0, offset + dock.height / 2, 0, 0, angle) + x;
        var new_y = rotateY(0, offset + dock.height / 2, 0, 0, angle) + y;

        return new Point(new_x, new_y);
    }
    
    // find the closest dockable point to (x, y)
    placeDock(x, y) {
        var closest = [];   // array of points on each line that are closest to (x, y)
        for (var i = 0; i < this.vertices.length - 1; i++) {
            var x1 = this.vertices[i].x;
            var y1 = this.vertices[i].y;
            var x2 = this.vertices[i + 1].x;
            var y2 = this.vertices[i + 1].y;
            var d = distance(x1, y1, x2, y2);
            if (d >= dock.width) {
                var theta = Math.atan2(y2 - y1, x2 - x1); // angle of wall
                var slope = nonzeroDivide(y2 - y1, x2 - x1);
                var jump = dock.width / 2  // distance from current possible dockable point on the wall to the next

                var p = closestOnLine(x, y, x1, y1, x2, y2);
                closest.push( {x: p.x, y: p.y, angle: theta});
                p = new Point(x1, y1);
                var dest = new Point(x2, y2);
                while (d >= 0) {
                    closest.push( {x: p.x, y: p.y, angle: theta});
                    p = getOtherPoint(p, dest, jump, slope);
                    d -= jump;
                }
            }
        }

        function compare(a, b) {
            var da = distance(x, y, a.x, a.y);
            var db = distance(x, y, b.x, b.y);
            
            return (da <= db) ? -1 : 1;
        }
        closest.sort(compare);

        for (var i = 0; i < closest.length; i++) {
            var curr = closest[i];
            var dock_p = this.isDockable(curr.x, curr.y, curr.angle);

            if (dock_p) {
                return { x: dock_p.x, y: dock_p.y, angle: curr.angle };
            } else {
                curr.angle += Math.PI;      // check the other side of the wall
                dock_p = this.isDockable(curr.x, curr.y, curr.angle);
                if (dock_p) {
                    return { x: dock_p.x, y: dock_p.y, angle: curr.angle };
                }
            }
        }

        return false;
    }

    finishWalls() {
        var wall_height = wall.height / wall_scale;
        var offset = wall_height / 2;
        for (var x = 0; x < canvas.width; x++) {
            for (var y = 0; y < canvas.height; y++) {
                // we cast a ray from the point to an arbitrary point
                var intersection_count = 0;
                var arbitrary_y = y;
                var arbitrary_x = 0;
                var intersects_vertex = true;
                while (intersects_vertex) {     // the ray must not fall on a vertex of the wall
                    var ray_slope = nonzeroDivide(y - arbitrary_y, x - arbitrary_x);
                    var constant  = y - ray_slope * x;
                    var found = false;
                    for (var i = 0; i < this.vertices.length; i++) {
                        var vertex_x = this.vertices[i].x;
                        var vertex_y = this.vertices[i].y;
                        // if a vertex that is not the current pixel is on the ray, change ray's y coordinate
                        if (vertex_y == ray_slope * vertex_x + constant && !(x == vertex_x && y == vertex_y)) {
                            arbitrary_y += (arbitrary_y <= canvas.height / 2) ? 1 : -1;
                            found = true;
                        }
                    }
                    if (!found) { intersects_vertex = false; }
                }

                for (var z = 0; z < this.vertices.length - 1; z++) {
                    var x1 = this.vertices[z].x;      // first endpoint
                    var y1 = this.vertices[z].y;
                    var x2 = this.vertices[z + 1].x;  // second endpoint
                    var y2 = this.vertices[z + 1].y;
                    var theta = Math.atan2(y2 - y1, x2 - x1); // angle of wall
                    var top_x = rotateX(0, offset, 0, 0, theta);
                    var top_y = rotateY(0, offset, 0, 0, theta);   
                    var bottom_x = rotateX(0, -offset, 0, 0, theta);
                    var bottom_y = rotateY(0, -offset, 0, 0, theta);

                    var rectangle = {   // the vertices of a single wall
                        A: new Point(x1 + top_x, y1 + top_y),
                        B: new Point(x1 + bottom_x, y1 + bottom_y),
                        C: new Point(x2 + top_x, y2 + top_y),
                        D: new Point(x2 + bottom_x, y2 + bottom_y)
                    }
                    // if point is inside a wall, it is an obstacle
                    if (pointInRectangle(new Point(x, y), rectangle)) {
                        obstacles[x][y] = true;
                        break;
                    }
                    var intersection = linesIntersect(x, y, arbitrary_x, arbitrary_y, x1, y1, x2, y2);
                    if (intersection) { intersection_count++; }
                }
                // when cast a ray from a point, if it intersects an even # of lines, it is outside; hence an obstacle
                if (intersection_count % 2 == 0) { obstacles[x][y] = true; }
            }
        }

        this.drawFloor();
        var p = this.placeDock(canvas.width / 2, canvas.height / 2, 0); // place dock close to the center of the canvas
        if (!p) {
            this.reset();
            return;
        }
        furniture_options.setup();
    }

    mouseDown(e) {
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        // calculate the current mouse position
        var mx = parseInt(e.clientX - offset.x);
        var my = parseInt(e.clientY - offset.y);

        // coerce mouse click into range of canvas
        var max_height = canvas.height - 1;
        var max_width = canvas.width - 1;
        my = Math.min(Math.max(my, 0), max_height);
        mx = Math.min(Math.max(mx, 0), max_width);

        if (this.currentlyDrawing) {
            // do not accept if two walls intersect
            if (this.wallsIntersect(mx, my)) { return; }

            var dx = mx - this.vertices[0].x; // distance to start coordinates of wall
            var dy = my - this.vertices[0].y;
            var r = 20;
            // finish wall if click is closer than 10 pixels to start of wall and if house has more than 2 vertices
            if (dx * dx + dy * dy < r * r && this.vertices.length > 2) {
                this.currentlyDrawing = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.buildWall(new Point(this.vertices[0].x, this.vertices[0].y)); // store the first corner as the last
                this.finishWalls();
                return;
            }
            // build current wall if currently drawing but not finished
            else {
                this.buildWall(new Point(mx, my));
            }
        }
        // begin wall
        else {
            this.storeCoordinate(new Point(mx, my)); // store first corner
            this.currentlyDrawing = true;
        }
    }

    mouseMove(e) {
        // return if we're not dragging
        if (!this.currentlyDrawing) { return; }

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        // calculate the current mouse position         
        var mx = parseInt(e.clientX - offset.x);
        var my = parseInt(e.clientY - offset.y);

        // erase old wall
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // do not accept if two walls intersect
        if (this.wallsIntersect(mx, my)) { return; }

        // position of last corner selected
        var x = this.vertices[this.vertices.length - 1].x;
        var y = this.vertices[this.vertices.length - 1].y;

        var p1 = new Point(x, y);
        var p2 = new Point(mx, my);
        this.drawWall(ctx, p1, p2);
    }

    mouseOut(e) {
        // return if we're not drawing
        if (!this.currentlyDrawing) { return; }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

