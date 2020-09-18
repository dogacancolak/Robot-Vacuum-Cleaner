class Spiral {
    constructor() {
        var steps = 150;
        this.turn = 2 * Math.PI / steps;
    }

    move() {
        robot.advance();
        robot.angle += this.turn;
        this.turn = this.turn / (1.01 - (0.01 - Math.abs(this.turn) / 22));
    }
}