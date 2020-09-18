

class Snaking {
    constructor() {
        this.turningRight = false;
        this.turningLeft  = false;
        this.degreesToTurn = 0;     // if currently turning, number of degrees left to turn in the given direction
        this.distanceNonstop = 0;    // If robot cannot advance 10 pixels uninterrupted, means it's trapped in a corner
        this.direction = robot.direction;
    }
}