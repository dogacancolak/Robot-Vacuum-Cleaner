class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(point) {
        this.x += point.x;
        this.y += point.y;
    }
}

function pointInRectangle(m, r) {
    var AB = vector(r.A, r.B);
    var AM = vector(r.A, m);
    var BC = vector(r.B, r.C);
    var BM = vector(r.B, m);
    var dotABAM = dot(AB, AM);
    var dotABAB = dot(AB, AB);
    var dotBCBM = dot(BC, BM);
    var dotBCBC = dot(BC, BC);
    return 0 <= dotABAM && dotABAM <= dotABAB && 0 <= dotBCBM && dotBCBM <= dotBCBC;
}

function vector(p1, p2) {
    return {
            x: (p2.x - p1.x),
            y: (p2.y - p1.y)
    };
}

function dot(u, v) {
    return u.x * v.x + u.y * v.y; 
}

// find the closest point on a line segment [(x1, y1), (x2, y2)] to another point (x, y)
function closestOnLine(x, y, x1, y1, x2, y2) {

    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
  
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
  
    var xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    return new Point(xx, yy);
  }

// new x coordinate after rotating (x, y) about (p, q) clockwise by angle
function rotateX(x, y, p, q, angle) {
    return (x - p) * Math.cos(angle) - (y - q) * Math.sin(angle) + p;
}

// new y coordinate after rotating (x, y) about (p, q) clockwise by angle
function rotateY(x, y, p, q, angle) {
    return (x - p) * Math.sin(angle) + (y - q) * Math.cos(angle) + q;
}

function rotate(point, p, q, angle) {
    var x = rotateX(point.x, point.y, p, q, angle);
    var y = rotateY(point.x, point.y, p, q, angle);

    return new Point(x, y);
}

function distance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function getOtherPoint(source, dest, d, m) { 
    // m is the slope of line, and the required Point lies distance away from the source Point 
    var a = new Point();
    var b = new Point();

    // slope is 0 
    if (m == 0) { 
        a.x = source.x + d; 
        a.y = source.y; 

        b.x = source.x - d; 
        b.y = source.y; 
    } else { 
        var dx = d / Math.sqrt(1 + m * m); 
        var dy = m * dx; 
        a.x = source.x + dx; 
        a.y = source.y + dy; 
        b.x = source.x - dx; 
        b.y = source.y - dy; 
    } 

    // calculate the distance of each point to the endpoint of wall
    var distance_a = Math.sqrt( (a.y - dest.y) * (a.y - dest.y) + (a.x - dest.x) * (a.x - dest.x));
    var distance_b = Math.sqrt( (b.y - dest.y) * (b.y - dest.y) + (b.x - dest.x) * (b.x - dest.x));

    // the closer point is returned
    if (distance_a < distance_b) {
        return a;
    } else {
        return b;
    }
}

// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
        return false;
    }

    denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    // Lines are parallel
    if (denominator === 0) {
        return false;
    }

    let ua = nonzeroDivide((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3), denominator);
    let ub = nonzeroDivide((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3), denominator);

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return false;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    return new Point(x, y);
  }

function nonzeroDivide(a, b) {
    var c = a / b;
    if (!isFinite(c)) {
        if (c < 0) {
            c = -99999999999;        // arbitrarily small number if negative infinity
        }
        else {
            c = 99999999999;
        }
    }
    return c;
}

function distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dy * dy + dx * dx);
}